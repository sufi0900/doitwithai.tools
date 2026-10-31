import { createHash } from "node:crypto";
import { toFile } from "openai";
import { getOpenAIClient } from "@/lib/ai-tools/openai";
import { knowledgeDocumentAsMarkdown } from "./knowledge";
import type { KnowledgeDocument } from "../types";

function fileNameFor(document: KnowledgeDocument) {
  const path = new URL(document.url).pathname
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .slice(0, 80);
  const fingerprint = createHash("sha1")
    .update(document.url)
    .digest("hex")
    .slice(0, 8);
  return `${path || "home"}-${fingerprint}.md`;
}

export function getSiteAssistantVectorStoreId() {
  return process.env.OPENAI_SITE_ASSISTANT_VECTOR_STORE_ID?.trim() || "";
}

async function getOrCreateVectorStore(vectorStoreId?: string) {
  if (vectorStoreId) return vectorStoreId;
  const store = await getOpenAIClient().vectorStores.create({
    name: "Do It With AI Tools website knowledge",
  });
  return store.id;
}

async function uploadDocument(
  vectorStoreId: string,
  document: KnowledgeDocument,
  generation: string,
) {
  const client = getOpenAIClient();
  const filename = fileNameFor(document);
  const upload = await client.files.create({
    file: await toFile(
      Buffer.from(knowledgeDocumentAsMarkdown(document), "utf8"),
      filename,
      { type: "text/markdown" },
    ),
    purpose: "assistants",
  });

  try {
    const attached = await client.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: upload.id,
        attributes: {
          url: document.url.slice(0, 512),
          title: document.title.slice(0, 512),
          kind: document.kind.slice(0, 128),
          generation,
        },
      },
      { pollIntervalMs: 1_500 },
    );
    if (attached.status !== "completed") {
      throw new Error(
        attached.last_error?.message ||
          `Indexing ended with ${attached.status}`,
      );
    }
    return attached.id;
  } catch (error) {
    await client.files.delete(upload.id).catch(() => undefined);
    throw error;
  }
}

async function listVectorFiles(vectorStoreId: string) {
  const files = [];
  for await (const file of getOpenAIClient().vectorStores.files.list(
    vectorStoreId,
    { limit: 100 },
  )) {
    files.push(file);
  }
  return files;
}

async function removeVectorFile(vectorStoreId: string, fileId: string) {
  const client = getOpenAIClient();
  await client.vectorStores.files
    .delete(fileId, { vector_store_id: vectorStoreId })
    .catch(() => undefined);
  await client.files.delete(fileId).catch(() => undefined);
}

export async function syncKnowledgeDocuments(
  documents: KnowledgeDocument[],
  requestedVectorStoreId = getSiteAssistantVectorStoreId(),
) {
  if (documents.length === 0) throw new Error("No knowledge documents to sync");
  const vectorStoreId = await getOrCreateVectorStore(requestedVectorStoreId);
  const generation = new Date().toISOString();
  const previousFiles = await listVectorFiles(vectorStoreId);
  const uploadedFileIds: string[] = [];

  try {
    for (const document of documents) {
      uploadedFileIds.push(
        await uploadDocument(vectorStoreId, document, generation),
      );
    }
  } catch (error) {
    await Promise.all(
      uploadedFileIds.map((fileId) => removeVectorFile(vectorStoreId, fileId)),
    );
    throw error;
  }

  await Promise.all(
    previousFiles.map((file) => removeVectorFile(vectorStoreId, file.id)),
  );

  return {
    vectorStoreId,
    generation,
    documents: documents.length,
    uploadedFileIds,
    removedFiles: previousFiles.length,
  };
}

export async function syncSingleKnowledgeDocument(
  document: KnowledgeDocument,
  vectorStoreId = getSiteAssistantVectorStoreId(),
) {
  if (!vectorStoreId) return { skipped: true as const };
  const generation = new Date().toISOString();
  const previousFiles = (await listVectorFiles(vectorStoreId)).filter(
    (file) => file.attributes?.url === document.url,
  );
  const fileId = await uploadDocument(vectorStoreId, document, generation);
  await Promise.all(
    previousFiles.map((file) => removeVectorFile(vectorStoreId, file.id)),
  );
  return { skipped: false as const, fileId, vectorStoreId };
}

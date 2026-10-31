// components/ResourceCardLayouts.js
import React from 'react';
import { PlayCircleOutline, Article, Code, Bolt } from '@mui/icons-material';

// --- 1. Image Card Layout ---
export const ImageCard = ({ resource, renderPreviewContent }) => (
  <div className="relative w-full h-full group overflow-hidden rounded-2xl">
    {/* Background Image */}
    <div className="absolute inset-0 transition-transform duration-500 ease-in-out group-hover:scale-110">
      {renderPreviewContent()}
    </div>
    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {/* Content that appears on hover */}
    <div className="relative h-full flex flex-col justify-end p-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <h3 className="text-2xl font-bold line-clamp-2 drop-shadow-lg">{resource.title}</h3>
      <p className="text-sm mt-1 text-blue-200 drop-shadow-md">{resource.resourceType}</p>
    </div>
  </div>
);

// --- 2. Video Card Layout ---
export const VideoCard = ({ resource, renderPreviewContent }) => (
  <div className="flex flex-col h-full">
    <div className="relative h-48 sm:h-56 flex-shrink-0 group overflow-hidden">
      {renderPreviewContent()}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <PlayCircleOutline sx={{ fontSize: 60 }} className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
      </div>
    </div>
    <div className="p-5 flex-grow flex flex-col">
      <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {resource.title}
      </h3>
      <div className="mt-auto pt-4">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">{resource.resourceType}</p>
      </div>
    </div>
  </div>
);

// --- 3. Document Card Layout ---
export const DocumentCard = ({ resource, renderPreviewContent }) => (
  <div className="flex flex-col h-full">
    <div className="h-48 sm:h-56 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
      {resource.previewSettings?.previewImage ? (
        renderPreviewContent()
      ) : (
        <Article sx={{ fontSize: 80 }} className="text-gray-300 dark:text-gray-600" />
      )}
    </div>
    <div className="p-5 flex-grow flex flex-col">
      <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {resource.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-grow">
        {resource.overview}
      </p>
      <div className="mt-auto pt-4">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">{resource.resourceType}</p>
      </div>
    </div>
  </div>
);

// --- 4. Prompt Card Layout ---
export const PromptCard = ({ resource }) => (
  <div className="flex flex-col h-full p-5 bg-blue-50/50 dark:bg-gray-800/50">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
        <Code className="text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {resource.title}
      </h3>
    </div>
    <div className="flex-grow overflow-y-auto pr-2 space-y-3">
      {resource.promptContent?.map((prompt, idx) => (
        <div key={idx} className="p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{prompt.promptTitle}</p>
        </div>
      ))}
    </div>
    <div className="mt-auto pt-4">
      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">{resource.resourceType}</p>
    </div>
  </div>
);

// --- 5. AI Tool Card Layout ---
export const AiToolCard = ({ resource, renderPreviewContent }) => (
  <div className="flex flex-col h-full">
    <div className="h-48 sm:h-56 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden group/img">
      {resource.previewSettings?.previewImage ? (
        <div className="transition-transform duration-300 ease-in-out group-hover:scale-105 w-full h-full">
            {renderPreviewContent()}
        </div>
      ) : (
        <Bolt sx={{ fontSize: 80 }} className="text-gray-300 dark:text-gray-600" />
      )}
    </div>
    <div className="p-5 flex-grow flex flex-col">
      <h3 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {resource.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-grow">
        {resource.overview}
      </p>
       <div className="mt-auto pt-4">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">{resource.resourceType}</p>
      </div>
    </div>
  </div>
);
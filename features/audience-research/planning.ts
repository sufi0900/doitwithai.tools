// Required business context is checked before starting a request.
export function inputErrors(input: {
  brief: string;
  websiteText: string;
  goal?: string;
}) {
  return {
    brief:
      input.brief.trim().length >= 25 || input.websiteText.trim().length >= 25
        ? ""
        : "Describe your offer in at least 25 characters, or enter a public website URL.",
    goal: "",
  };
}

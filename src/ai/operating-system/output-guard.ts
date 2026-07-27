const maximumAiOperatingSystemOutputLength = 24_000;
const secretLikeOutputPattern =
  /(?:authorization\s*:\s*bearer|(?:api|access|secret)[_\s-]?key\s*[:=]|password\s*[:=]|sk-[a-z0-9]{16,})/iu;

export function isSafeAiOperatingSystemOutput(value: string): boolean {
  const normalizedValue = value.trim();

  return (
    normalizedValue.length > 0 &&
    normalizedValue.length <= maximumAiOperatingSystemOutputLength &&
    !secretLikeOutputPattern.test(normalizedValue)
  );
}

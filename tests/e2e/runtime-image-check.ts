type Revalidation = {
  browserName: string;
  code: string | undefined;
  url: string;
  status: number | undefined;
  knownImages: ReadonlySet<string>;
  decodedImages: ReadonlySet<string> | undefined;
};

export function isVerifiedImageRevalidationCancellation(value: Revalidation): boolean {
  return value.browserName === "firefox" && value.code === "NS_BINDING_ABORTED" &&
    value.status === 304 && value.knownImages.has(value.url) &&
    value.decodedImages?.has(value.url) === true;
}

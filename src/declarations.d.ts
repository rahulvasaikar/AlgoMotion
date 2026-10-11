declare module "whisper-node" {
  const whisper: (filePath: string, options?: Record<string, unknown>) => Promise<unknown>;
  export default whisper;
}

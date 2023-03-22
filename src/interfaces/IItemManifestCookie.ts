import type IManifestItemDefinition from '@interfaces/IManifestItemDefinition';

interface IItemManifestCookie {
	version: string;
	manifest: Record<string, IManifestItemDefinition>;
}
export default IItemManifestCookie;

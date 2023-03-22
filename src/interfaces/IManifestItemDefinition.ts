interface IManifestItemDefinition {
	displayProperties: {
		name: string;
		icon: string | undefined;
	};
	itemTypeDisplayName: string;
	itemCategoryHashes: {
		0: number | undefined;
		1: number | undefined;
		2: number | undefined;
	};
	classType: number;
}

export default IManifestItemDefinition;

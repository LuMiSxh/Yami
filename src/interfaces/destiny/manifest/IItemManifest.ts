interface IItemManifest {
	displayProperties: {
		name: string;
		icon: string | undefined;
	};
	itemTypeDisplayName: string;
	itemCategoryHashes: Record<0 | 1 | 2, number | undefined>;
	classType: number;
}

export default IItemManifest;

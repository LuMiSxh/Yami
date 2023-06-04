interface IItemManifest {
	displayProperties: {
		name: string;
		icon: string | undefined;
		watermark: string | undefined;
	};
	itemTypeDisplayName: string;
	itemCategoryHashes: Record<number, number | undefined>;
	classType: 0 | 1 | 2 | 3;
	itemSubType: number;
	itemTypeAndTierDisplayName: string | undefined;
}

export default IItemManifest;

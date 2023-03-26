interface IActivityManifest {
	displayProperties: {
		name: string;
		icon: string | undefined;
	};
	completionUnlockHash: number;
	activityLightLevel: number;
	destinationHash: number;
	placeHash: number;
	activityTypeHash: number;
	matchmaking: {
		isMatchmade: boolean;
		minParty: number;
		maxParty: number;
		maxPlayers: number;
	};
	directActivityModeHash: number;
	directActivityModeType: number;
	activityModeHashes: Record<0 | 1 | 2, number | undefined>;
	activityModeTypes: Record<0 | 1 | 2, number | undefined>;
	hash: number;
}

export default IActivityManifest;

interface ISession {
	access: {
		token: string;
		expirationDate: Date;
	};
	refresh: {
		token: string;
		expirationDate: Date;
	};
	bnetId: string;
	destiny2: {
		membershipId: string;
		membershipType: 1 | 2 | 3 | 4 | 5 | 254;
		name: string;
	};
}

export default ISession;

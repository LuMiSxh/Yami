interface IAccessSession {
	access: {
		token: string;
		expires_at: Date;
	};
	refresh: {
		token: string;
		expires_at: Date;
	};

	bnet: {
		id: string;
		icon: string;
		name: string;
	};
	d2: {
		id: string;
		type: 1 | 2 | 3 | 4 | 5 | 254;
		name: string;
	};
}

export default IAccessSession;

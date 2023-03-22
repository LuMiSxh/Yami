interface ICharacterSession {
	characters: ICharacter[];
	refresh_at: Date;
}

interface ICharacter {
	id: string;
	class: string;
	emblem: {
		icon: string;
		background: string;
		color: [number, number, number];
	};
}

export default ICharacterSession;
export type { ICharacter };

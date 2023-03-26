interface ICharacter {
	id: string;
	class: 'Titan' | 'Hunter' | 'Warlock';
	emblem: {
		icon: string;
		background: string;
		color: [number, number, number];
	};
}

export default ICharacter;

interface ICharacter {
	id: string;
	class: 'Titan' | 'Hunter' | 'Warlock';
	classId: 0 | 1 | 2;
	emblem: {
		icon: string;
		background: string;
		color: [number, number, number];
	};
}

export default ICharacter;

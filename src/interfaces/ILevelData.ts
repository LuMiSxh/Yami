import type IItem from '@interfaces/IItem';

interface ILevelData {
	kinetic: IItem;
	energy: IItem;
	power: IItem;
	Titan: {
		helmet: IItem;
		gauntlet: IItem;
		chest: IItem;
		leg: IItem;
		class: IItem;
		power: {
			full: number;
			partial: number;
		};
	};
	Hunter: {
		helmet: IItem;
		gauntlet: IItem;
		chest: IItem;
		leg: IItem;
		class: IItem;
		power: {
			full: number;
			partial: number;
		};
	};
	Warlock: {
		helmet: IItem;
		gauntlet: IItem;
		chest: IItem;
		leg: IItem;
		class: IItem;
		power: {
			full: number;
			partial: number;
		};
	};
}

export default ILevelData;

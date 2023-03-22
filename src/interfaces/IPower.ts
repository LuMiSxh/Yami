import type IItem from '@interfaces/IItem';

interface IPower {
	kinetic: IItem;
	energy: IItem;
	power: IItem;
	Armor: Record<
		string,
		{
			helmet: IItem;
			gauntlet: IItem;
			chest: IItem;
			leg: IItem;
			class: IItem;
			power: {
				full: number;
				partial: number;
			};
		}
	>;
}

export default IPower;

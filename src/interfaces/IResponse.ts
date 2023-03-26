interface IResponse<T> {
	data: T;
	status: 'ok' | 'err';
	message: string;
}

export default IResponse;

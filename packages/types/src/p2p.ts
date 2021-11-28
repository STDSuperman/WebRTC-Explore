export enum SocketEventsEnum {
  SET_OFFER_DESCRIPTION = 'SET_OFFER_DESCRIPTION',
  SET_ANSWER_DESCRIPTION = 'SET_ANSWER_DESCRIPTION',
  SET_ICE_CANDIDATE = 'SET_ICE_CANDIDATE',
  SET_LOCAL_ICE_CANDIDATE = 'SET_LOCAL_ICE_CANDIDATE',
  CONNECTION = 'CONNECTION',
}

export interface ICandidateInfo extends IUserSendInfo {
	candidate: RTCIceCandidate;
}

export interface IUserSendInfo {
  targetId: string;
  fromId: string;
}

export interface IOfferInfo extends IUserSendInfo {
	offer: RTCSessionDescriptionInit;
}

export interface IConnectionInfo {
  id: string;
}

export interface IAnswerInfo extends IUserSendInfo {
  answer: RTCSessionDescriptionInit
}
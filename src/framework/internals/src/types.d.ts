export interface ActionManifest {
  Name: string;
  Payload: ActionPayload;
  Response: ActionResponse;
  Handler(payload: ActionPayload): Promise<ActionResponse>;
}

export interface ActionPayload {

}

export interface ActionResponse {

}

export interface EventManifest {
  Name: string;
}

export interface SubscriberManifest {
  Name: string;
}

export interface ViewManifest {
  Name: string;
}

export type ServiceManifest = {
  Views?: Array<ViewManifest>;
  Actions?: Array<ActionManifest>;
  Subscribers?: Array<SubscriberManifest>
  Events?: Array<EventManifest>;
};

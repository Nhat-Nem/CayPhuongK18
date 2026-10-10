export class CreateRoomDTO {
  code?: string;
  name: string;
  type?: string;
  description: string;
  price: number;
  status: string;
  capacity: number;
  image?: string | null;
  secondaryImage?: string | null;
}

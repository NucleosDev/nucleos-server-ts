export interface NotificationDto {
  id: string;
  userId: string;
  titulo: string | null;
  mensagem: string | null;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationDto {
  userId: string;
  titulo: string;
  mensagem: string;
}
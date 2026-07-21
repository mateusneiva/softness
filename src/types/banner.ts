export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  link: string | null;
  buttonText?: string | null;
  order: number;
  active: boolean;
}

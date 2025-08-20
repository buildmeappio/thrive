export interface IReviewExaminerData {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  province: string;
  address: string;
}
export interface IReviewExaminerField {
  label: string;
  value: string;
  type: 'text' | 'download' | 'specialty';
}
export interface IReviewExaminerAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  color: string;
}
export interface IRequestMoreInfoProps {
  isOpen: boolean;
  onClose: () => void;
  examinerName: string;
}
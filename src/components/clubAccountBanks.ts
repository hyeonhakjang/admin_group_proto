export interface BankItem {
  id: string;
  name: string;
}

export const bankOptions: BankItem[] = [
  { id: "kb", name: "KB국민은행" },
  { id: "shinhan", name: "신한은행" },
  { id: "hana", name: "하나은행" },
  { id: "wouri", name: "우리은행" },
  { id: "nh", name: "NH농협은행" },
  { id: "ibk", name: "IBK기업은행" },
  { id: "kakao", name: "카카오뱅크" },
  { id: "toss", name: "토스뱅크" },
];

export const getBankById = (id?: string) =>
  bankOptions.find((bank) => bank.id === id);


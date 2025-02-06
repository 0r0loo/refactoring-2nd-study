import invoices from './invoices.json';
import plays from './plays.json';

type Performance = {
  playID: string;
  audience: number;
};

type Invoice = {
  customer: string;
  performances: Performance[];
};

type Plays = Record<
  string,
  {
    name: string;
    type: 'tragedy' | 'comedy';
  }
>;

function sum(arr: number[]) {
  return arr.reduce((acc, cur) => acc + cur, 0);
}

const createReceipt = ({
  invoice,
  totalAmount,
  volumeCredits,
  plays,
  language = 'ko',
}: {
  invoice: Invoice;
  totalAmount: number;
  volumeCredits: number;
  plays: Plays;
  language?: string;
}) => {
  const { customer, performances } = invoice;
  const content = performances
    .map((performance) => {
      const play = plays[performance.playID];
      const amount = calculateAmount({
        type: play.type,
        audience: performance.audience,
      });
      return `${play.name}: ${formatAmount({ amount, language })} (${performance.audience}석)`;
    })
    .join('\n');

  return `
청구 내역 (고객명: ${customer})
${content}
총액: ${formatAmount({ amount: totalAmount, language })}
적립 포인트: ${volumeCredits}점`;
};

// 포인트 계산해주는 함수
const calculateVolumeCredits = ({
  type,
  audience,
}: {
  type: 'tragedy' | 'comedy';
  audience: number;
}) => {
  if (type === 'comedy')
    return Math.max(audience - 30, 0) + Math.floor(audience / 5);
  return Math.max(audience - 30, 0);
};

// 가격 계산해주는 함수
function calculateAmount({
  type,
  audience,
}: {
  type: 'tragedy' | 'comedy';
  audience: number;
}) {
  if (type === 'comedy') {
    const baseAmount = 30000;
    if (audience > 20) {
      return baseAmount + 10000 + 500 * (audience - 20) + 300 * audience;
    }
  }

  if (type === 'tragedy') {
    const baseAmount = 40000;
    if (audience > 30) {
      return baseAmount + 1000 * (audience - 30);
    }
  }

  throw new Error(`알 수 없는 장르: ${type}`);
}

// 원화로 변환 해주는 함수
const convertToKRW = (amount: number) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount / 100);

// 언어 별로 돈은 변환해주는 함수
const formatAmount = ({
  amount,
  language,
}: {
  amount: number;
  language?: string;
}) => {
  if (language === 'ko') return convertToKRW(amount);

  return convertToKRW(amount);
};

function statement(invoice: Invoice, plays: Plays) {
  const { performances } = invoice;

  const calculateArgs = performances.map(performance => ({ type: plays[performance.playID].type, audience: performance.audience }));

  return createReceipt({
    invoice,
    totalAmount: sum(calculateArgs.map(calculateAmount)),
    volumeCredits: sum(calculateArgs.map(calculateVolumeCredits)),
    plays,

    // 만약 다국어를 지원한다면....
    language: 'ko',
  });
}

console.log(statement(invoices[0], plays as Plays));

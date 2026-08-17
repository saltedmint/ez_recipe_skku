import { NextResponse } from 'next/server';

const SYSTEM_RULE = `너는 자취생을 위한 레시피 셰프다. 반드시 지켜라: 조리 도구는 2개 이하, 총 조리 시간은 15분 이내, 사용자가 선택한 재료와 양념만 최대한 활용한다. 부족한 양념은 substituteTip에 대체 꿀팁 1줄로 쓴다. 재료 조합마다 조리 카테고리를 다르게 판단한다: 밥은 볶음밥, 라면사리는 라면/전골, 식빵은 토스트, 두부는 조림/구이, 계란은 전/오믈렛, 김치는 볶음/찌개 중 가장 어울리는 방법을 선택한다. 이전 답변과 같은 제목·조리법을 반복하지 말고, 선택 재료의 특징이 제목과 모든 단계에 드러나게 한다. 다른 설명 없이 아래 JSON 스키마만 반환한다: recipeName, cookingTime, difficulty, dishwashingScore, ingredientsUsed(문자열 배열), substituteTip, steps(문자열 배열).`;

export async function POST(request) {
  const { ingredients = [], seasonings = [] } = await request.json();
  if (!ingredients.length) return NextResponse.json({ error: '재료를 하나 이상 선택해주세요.' }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ recipeName: '초간단 자투리 재료 한 팬 볶음', cookingTime: '10분', difficulty: '쉬움', dishwashingScore: '프라이팬 1개 · 숟가락 1개', ingredientsUsed: [...ingredients, ...seasonings].slice(0, 6), substituteTip: '간장이 없다면 소금과 설탕을 아주 조금 넣어 간을 맞춰보세요.', steps: [`1단계: 팬에 식용유를 두르고 ${ingredients.slice(0, 2).join('와 ')}을 3분간 볶습니다.`, '2단계: 가진 양념을 넣고 재료에 고루 배도록 섞습니다.', '3단계: 불을 끄고 간을 본 뒤 그릇 하나에 담아냅니다.'] });
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM_RULE }, { role: 'user', content: `재료: ${ingredients.join(', ')}\n양념: ${seasonings.join(', ')}` }] }) });
  if (!response.ok) return NextResponse.json({ error: '레시피 생성에 실패했습니다.' }, { status: 502 });
  const data = await response.json(); return NextResponse.json(JSON.parse(data.choices[0].message.content));
}

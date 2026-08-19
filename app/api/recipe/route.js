import { NextResponse } from 'next/server';

const SYSTEM_RULE = `너는 자취생을 위한 현실적인 레시피 셰프다. 반드시 지켜라.
1) 사용자가 고른 주재료와 양념만 사용한다. 선택하지 않은 재료를 ingredientsUsed나 조리 단계에 절대 추가하지 않는다. 물은 조리에 필요한 경우에만 사용할 수 있다.
2) 재료 조합상 실제로 함께 먹을 수 있는 요리만 제안한다. 선택 재료가 6개 이상이면 한 레시피에 주재료 4개 이하만 사용하고, 서로 어울리는 일부 재료를 우선한다. 어울리지 않는 조합이면 가장 적은 재료만 골라 무리하지 않는 계란전, 볶음, 조림 중 하나로 만든다.
3) 조리 도구는 2개 이하, 총 조리 시간은 15분 이내, 1인분 기준이다. 생으로 먹으면 위험한 재료는 반드시 충분히 익힌다.
4) 조리 순서는 재료 손질, 가열, 양념, 익힘, 마무리를 구분해 3~5단계로 구체적으로 작성한다.
5) 재료에 맞는 조리 카테고리를 선택한다: 밥은 볶음밥, 라면사리는 라면, 식빵은 토스트, 두부는 조림/구이, 계란은 전/오믈렛, 김치는 볶음/찌개.
6) nutrition 객체에 1인분 기준 예상 영양 정보를 calories, protein, carbs, fat 문자열로 포함한다.
7) JSON 외의 설명은 절대 하지 않는다. JSON 스키마: recipeName, cookingTime, difficulty, dishwashingScore, ingredientsUsed(문자열 배열), substituteTip, nutrition(객체), steps(문자열 배열).`;

function safeRecipe(ingredients, seasonings, variation = 0) {
  const main = ingredients.slice(0, 2).join('와 ');
  const has = (name) => ingredients.includes(name);
  const seasoning = seasonings.length ? seasonings.slice(0, 2).join(', ') : '소금/후추';
  if (has('라면사리')) return { recipeName: `${has('김치') ? '김치 ' : ''}계란 라면`, cookingTime: '10분', difficulty: '쉬움', dishwashingScore: '냄비 1개 · 젓가락 1개', ingredientsUsed: ingredients.filter(x => ['라면사리','김치','계란','대파'].includes(x)), substituteTip: '고춧가루가 없다면 김치 국물로 칼칼한 맛을 더해보세요.', nutrition: { calories: '약 490kcal', protein: '단백질 14g', carbs: '탄수화물 68g', fat: '지방 17g' }, steps: ['1단계: 냄비에 물을 끓이고 김치나 대파를 2분간 익힙니다.', '2단계: 라면사리를 넣고 3분간 끓입니다.', '3단계: 계란을 풀어 넣고 젓지 않은 채 1분 익힙니다.', '4단계: 가진 양념으로 간을 맞춥니다.', '5단계: 불을 끄고 그릇에 담아 따뜻하게 먹습니다.'] };
  if (has('식빵')) return { recipeName: `${has('계란') ? '계란 ' : ''}${has('스팸') ? '스팸 ' : ''}식빵 토스트`, cookingTime: '8분', difficulty: '쉬움', dishwashingScore: '프라이팬 1개 · 접시 1개', ingredientsUsed: ingredients.filter(x => ['식빵','계란','스팸','참치캔'].includes(x)), substituteTip: '식용유가 없다면 식빵을 약불에 그대로 구워도 괜찮아요.', nutrition: { calories: '약 380kcal', protein: '단백질 16g', carbs: '탄수화물 43g', fat: '지방 15g' }, steps: ['1단계: 식빵과 선택한 재료를 먹기 좋은 크기로 준비합니다.', '2단계: 팬을 약불로 달구고 식빵 한 면을 1분 굽습니다.', '3단계: 재료를 올리고 간장이나 케첩을 소량 더합니다.', '4단계: 식빵을 덮어 앞뒤로 노릇하게 굽습니다.', '5단계: 반으로 잘라 따뜻할 때 먹습니다.'] };
  if (has('밥')) return { recipeName: `${has('김치') ? '김치 ' : ''}${has('참치캔') ? '참치 ' : has('스팸') ? '스팸 ' : ''}볶음밥`, cookingTime: '10분', difficulty: '쉬움', dishwashingScore: '프라이팬 1개 · 주걱 1개', ingredientsUsed: ingredients.filter(x => ['밥','김치','참치캔','스팸','계란','양파','대파'].includes(x)), substituteTip: `${seasoning}이 없다면 소금/후추로 간을 맞춰보세요.`, nutrition: { calories: '약 520kcal', protein: '단백질 19g', carbs: '탄수화물 72g', fat: '지방 16g' }, steps: ['1단계: 밥을 미리 풀어두고 선택한 재료를 잘게 썹니다.', '2단계: 팬에 기름을 두르고 주재료를 3분간 볶습니다.', '3단계: 밥과 가진 양념을 넣고 센 불에 고루 섞습니다.', '4단계: 밥알이 고슬고슬해질 때까지 2분 더 볶습니다.', '5단계: 불을 끄고 간을 확인한 뒤 그릇에 담습니다.'] };
  if (has('두부')) return { recipeName: `${main} 달큰 간장조림`, cookingTime: '12분', difficulty: '쉬움', dishwashingScore: '프라이팬 1개 · 숟가락 1개', ingredientsUsed: ingredients.filter(x => ['두부','계란','양파','대파'].includes(x)), substituteTip: '간장이 없다면 소금/후추를 조금 넣고 간을 맞춰보세요.', nutrition: { calories: '약 350kcal', protein: '단백질 18g', carbs: '탄수화물 28g', fat: '지방 16g' }, steps: ['1단계: 두부의 물기를 닦고 한입 크기로 자릅니다.', '2단계: 팬에 기름을 두르고 두부 양면을 노릇하게 굽습니다.', `3단계: ${seasoning}과 물 3스푼을 넣습니다.`, '4단계: 양념이 자작해질 때까지 4분 졸입니다.', '5단계: 불을 끄고 대파나 참기름이 있으면 올립니다.'] };
  return { recipeName: `${main || '자투리 재료'} 계란전`, cookingTime: '10분', difficulty: '쉬움', dishwashingScore: '프라이팬 1개 · 젓가락 1개', ingredientsUsed: ingredients.slice(0, 4), substituteTip: '계란이 없다면 재료를 작게 썰어 간장 볶음으로 만들어보세요.', nutrition: { calories: '약 350kcal', protein: '단백질 18g', carbs: '탄수화물 28g', fat: '지방 16g' }, steps: ['1단계: 선택한 재료를 작게 썰어 익는 시간을 맞춥니다.', '2단계: 계란이 있으면 재료와 소금/후추를 섞습니다.', '3단계: 달군 팬에 한 숟가락씩 올립니다.', '4단계: 앞뒤로 2분씩 충분히 익힙니다.', '5단계: 불을 끄고 간을 확인한 뒤 따뜻하게 냅니다.'] };
}

function isValidRecipe(recipe, allowed) {
  return recipe && typeof recipe.recipeName === 'string' && typeof recipe.cookingTime === 'string' && Array.isArray(recipe.ingredientsUsed) && recipe.ingredientsUsed.length > 0 && recipe.ingredientsUsed.every(item => allowed.has(item)) && Array.isArray(recipe.steps) && recipe.steps.length >= 3 && recipe.steps.length <= 5 && recipe.steps.every(step => typeof step === 'string' && step.length > 8) && recipe.nutrition && typeof recipe.nutrition.calories === 'string';
}

export async function POST(request) {
  const body = await request.json();
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients.filter(Boolean).slice(0, 15) : [];
  const seasonings = Array.isArray(body.seasonings) ? body.seasonings.filter(Boolean).slice(0, 10) : [];
  const variation = Number(body.variation) || 0;
  if (!ingredients.length) return NextResponse.json({ error: '재료를 하나 이상 선택해주세요.' }, { status: 400 });
  const fallback = safeRecipe(ingredients, seasonings, variation);
  if (!process.env.OPENAI_API_KEY) return NextResponse.json(fallback);
  const allowed = new Set([...ingredients, ...seasonings]);
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM_RULE }, { role: 'user', content: `선택한 주재료: ${ingredients.join(', ')}\n보유 양념: ${seasonings.join(', ')}\n허용 목록 밖의 재료는 절대 사용하지 마라. 다른 레시피 요청 번호: ${variation}` }] }) });
  if (!response.ok) return NextResponse.json(fallback);
  try { const data = await response.json(); const recipe = JSON.parse(data.choices[0].message.content); return NextResponse.json(isValidRecipe(recipe, allowed) ? recipe : fallback); } catch { return NextResponse.json(fallback); }
}

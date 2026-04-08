import React, { useState, useEffect, useRef } from 'react';

// --- ゲームデータ定義 ---
const INITIAL_CASH = 1000000;
const MAX_TURNS = 24;

const STOCKS = {
  IT: { name: 'ITメガベンチャー', risk: 'high', basePrice: 1000, icon: '💻', desc: 'ハイリスク・ハイリターン。金利に敏感。' },
  FOOD: { name: '安定食品メーカー', risk: 'low', basePrice: 1000, icon: '🍞', desc: 'ローリスク・ローリターン。景気に左右されにくい。' },
  EXPORT: { name: 'グローバル自動車', risk: 'medium', basePrice: 1000, icon: '🚗', desc: 'ミドルリスク。円安で上がり、円高で下がる。' }
};

const BOARD_SQUARES = [
  { id: 0, type: 'START', label: 'スタート/給料', icon: '🏁', color: 'bg-blue-100 text-blue-800', explanation: '1ヶ月の始まりです。給料をもらって投資の資金にしましょう！手元の資金（キャッシュ）を増やすことが投資の第一歩です。' },
  { id: 1, type: 'NEWS_MACRO_BOOM', label: '好景気ニュース', icon: '📈', color: 'bg-red-100 text-red-800', explanation: '【マクロ経済】景気回復！モノがよく売れるようになり、企業の利益が増え、人々の給料も増えやすくなります。経済全体が活気づき、市場全体の株価が上がりやすくなります。' },
  { id: 2, type: 'EVENT_IT_UP', label: 'IT企業 新サービス', icon: '🏢', color: 'bg-purple-100 text-purple-800', explanation: '【個別株要因】個別企業のポジティブなニュースは、その企業の株価を直接押し上げます。画期的なイノベーションはIT企業の大きな成長エンジンです。' },
  { id: 3, type: 'NEWS_RATE_UP', label: '金利引上げ', icon: '🏦', color: 'bg-yellow-100 text-yellow-800', explanation: '【マクロ経済】中央銀行が金利を上げると、銀行に預けるメリットが増える一方、企業はお金を借りにくくなります。将来の成長に期待して買われているIT株などは、成長スピードが落ちる懸念から特に下落しやすくなります。' },
  { id: 4, type: 'SALARY', label: '臨時収入', icon: '💰', color: 'bg-green-100 text-green-800', explanation: '思わぬ臨時収入！投資に回すチャンスです。資金が増えれば、取れるリスクや選択肢も広がります。' },
  { id: 5, type: 'EVENT_FOOD_DOWN', label: '食品 不祥事', icon: '📉', color: 'bg-gray-200 text-gray-800', explanation: '【個別株要因】不祥事などのネガティブなニュースは、その企業の信用を落とし、株価急落の原因になります。これを『個別株リスク』と呼びます。' },
  { id: 6, type: 'NEWS_FX_YEN_DOWN', label: '急激な円安', icon: '💴', color: 'bg-orange-100 text-orange-800', explanation: '【為替】円安（例: 1ドル100円→150円）になると、海外で稼いだ外貨を日本円に直したときの金額が増えます。そのため、自動車などの輸出企業には大きなプラスとなり株価が上がりやすくなります。' },
  { id: 7, type: 'EVENT_EXPORT_UP', label: '自動車 売上好調', icon: '🚗', color: 'bg-purple-100 text-purple-800', explanation: '【個別株要因】製品の大ヒットは売上高の増加に直結します。業績が良くなるという期待から、投資家が株を買い求め株価が上がります。' },
  { id: 8, type: 'NEWS_MACRO_RECESSION', label: '不景気ニュース', icon: '📉', color: 'bg-blue-200 text-blue-900', explanation: '【マクロ経済】景気後退（リセッション）！人々の財布の紐が固くなり、モノが売れなくなります。企業の利益が減るため、市場全体の株価が下がりやすくなります。' },
  { id: 9, type: 'EVENT_IT_DOWN', label: 'IT 情報漏洩', icon: '⚠️', color: 'bg-gray-300 text-gray-900', explanation: '【個別株要因】情報漏洩などのトラブルは企業の致命傷になり得ます。このような急激な下落リスクを避けるために、複数の銘柄に分ける『分散投資』が重要です。' },
  { id: 10, type: 'SALARY', label: 'ボーナス', icon: '💰', color: 'bg-green-100 text-green-800', explanation: 'ボーナス獲得！すべて現金で持っておくか、それとも株に変えてさらに増やすか。投資家の腕の見せ所です。' },
  { id: 11, type: 'NEWS_RATE_DOWN', label: '金利引下げ', icon: '🏦', color: 'bg-yellow-100 text-yellow-800', explanation: '【マクロ経済】金利引き下げ！企業が低い利息でお金を借りられるようになり、新規事業への投資が活発になります。株式市場にお金が流れやすくなり、成長期待の高いIT株などが上がりやすくなります。' },
  { id: 12, type: 'EVENT_FOOD_UP', label: '食品 新商品ヒット', icon: '🍞', color: 'bg-purple-100 text-purple-800', explanation: '【個別株要因】食品メーカーは不景気でも人々が毎日食べるため安定していますが、ヒット商品が出ればさらに株価が大きく上がる可能性があります。' },
  { id: 13, type: 'NEWS_FX_YEN_UP', label: '急激な円高', icon: '💴', color: 'bg-orange-100 text-orange-800', explanation: '【為替】円高（例: 1ドル150円→100円）になると、輸出企業は海外で同じ値段で売っても、日本円に換算したときの利益が減ってしまいます。そのため輸出企業の株価にはマイナス要因です。' },
  { id: 14, type: 'TAX', label: '税金支払い', icon: '💸', color: 'bg-red-200 text-red-900', explanation: '投資の利益や資産には税金がかかることがあります。支払いのために手元の現金（キャッシュ）をある程度確保しておく『流動性』の管理も大切です。' },
  { id: 15, type: 'EVENT_ALL_RANDOM', label: '大統領選挙', icon: '🗳️', color: 'bg-indigo-100 text-indigo-800', explanation: '【マクロ経済】政治の大きな変化（選挙など）は、市場全体を揺るがします。どのような政策が行われるかによって株価が乱高下するため、リスク管理が問われます。' },
];

// 16マスのハニカム配置（スパイラル状に周回する座標：row 0~3, col 0~4）
const HEX_POSITIONS = [
  { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, // 0, 1, 2
  { r: 1, c: 3.5 }, { r: 2, c: 4 }, { r: 3, c: 3.5 }, // 3, 4, 5
  { r: 3, c: 2.5 }, { r: 3, c: 1.5 }, { r: 3, c: 0.5 }, // 6, 7, 8
  { r: 2, c: 0 }, { r: 1, c: 0.5 }, // 9, 10
  { r: 1, c: 1.5 }, { r: 1, c: 2.5 }, // 11, 12 (内側へ)
  { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 } // 13, 14, 15 (内側ループ、0へ繋がる)
];

export default function App() {
  // --- ステート管理 ---
  const [gameState, setGameState] = useState('START'); // START, PLAYING, END
  const [turn, setTurn] = useState(1);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [holdings, setHoldings] = useState({ IT: 0, FOOD: 0, EXPORT: 0 });
  const [prices, setPrices] = useState({ IT: 1000, FOOD: 1000, EXPORT: 1000 });
  const [position, setPosition] = useState(0);
  const [economy, setEconomy] = useState('NORMAL'); // NORMAL, BOOM, RECESSION
  const [logs, setLogs] = useState([{ turn: 0, msg: 'ゲームスタート！まずは株を買ってみましょう。準備ができたらサイコロを振ってください。', type: 'info' }]);
  const [diceResult, setDiceResult] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null); // 学習モーダル用
  
  const logContainerRef = useRef(null);

  // ログが追加されたら、ログエリア内のみ自動スクロール
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // --- ゲームロジック ---
  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { turn, msg, type }]);
  };

  const getMultiplier = (min, max) => Math.random() * (max - min) + min;

  const updatePrices = (multipliers) => {
    setPrices(prev => ({
      IT: Math.max(10, Math.floor(prev.IT * (multipliers.IT || 1))),
      FOOD: Math.max(10, Math.floor(prev.FOOD * (multipliers.FOOD || 1))),
      EXPORT: Math.max(10, Math.floor(prev.EXPORT * (multipliers.EXPORT || 1))),
    }));
  };

  const handleTrade = (stockKey, isBuy) => {
    const price = prices[stockKey];
    const amount = 100; // 100株単位で取引
    const cost = price * amount;

    if (isBuy) {
      if (cash >= cost) {
        setCash(prev => prev - cost);
        setHoldings(prev => ({ ...prev, [stockKey]: prev[stockKey] + amount }));
        addLog(`${STOCKS[stockKey].name}を${amount}株買いました。（-${cost.toLocaleString()}円）`, 'trade');
      }
    } else {
      if (holdings[stockKey] >= amount) {
        setCash(prev => prev + cost);
        setHoldings(prev => ({ ...prev, [stockKey]: prev[stockKey] - amount }));
        addLog(`${STOCKS[stockKey].name}を${amount}株売りました。（+${cost.toLocaleString()}円）`, 'trade');
      }
    }
  };

  const rollDice = () => {
    if (gameState !== 'PLAYING') return;

    // サイコロ2つ
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    setDiceResult({ d1, d2, total });

    let newPos = (position + total) % BOARD_SQUARES.length;
    setPosition(newPos);
    
    if (position + total >= BOARD_SQUARES.length) {
      setCash(prev => prev + 200000);
      addLog('🎯 スタート地点を通過！給料200,000円を獲得しました。', 'good');
    }

    addLog(`🎲 サイコロで「${d1}」と「${d2}」（合計：${total}）が出ました。`);
    handleSquareEvent(newPos);
    applyMarketFluctuation();

    if (turn >= MAX_TURNS) {
      setGameState('END');
      addLog('🏁 24ターンが終了しました！ゲームクリアです！', 'info');
    } else {
      setTurn(prev => prev + 1);
    }
  };

  const handleSquareEvent = (posIndex) => {
    const square = BOARD_SQUARES[posIndex];
    addLog(`📍 【${square.label}】マスに止まりました。`, 'event');

    switch (square.type) {
      case 'SALARY':
        setCash(prev => prev + 300000);
        addLog('💰 臨時収入！300,000円を獲得しました。', 'good');
        break;
      case 'TAX':
        setCash(prev => prev - 150000);
        addLog('💸 税金の支払い！150,000円を支払いました。', 'bad');
        break;
      case 'NEWS_MACRO_BOOM':
        setEconomy('BOOM');
        addLog('📈 景気回復の兆し！経済状態が「好景気」になり、全体的に株価が上がりやすくなります。', 'good');
        break;
      case 'NEWS_MACRO_RECESSION':
        setEconomy('RECESSION');
        addLog('📉 景気後退の懸念！経済状態が「不景気」になり、全体的に株価が下がりやすくなります。', 'bad');
        break;
      case 'NEWS_RATE_UP':
        updatePrices({ IT: getMultiplier(0.8, 0.9), FOOD: 1.0, EXPORT: 0.95 });
        addLog('🏦 金利上昇！借金をして成長するIT企業には向かい風となり、IT株が大きく下がりました。', 'bad');
        break;
      case 'NEWS_RATE_DOWN':
        updatePrices({ IT: getMultiplier(1.1, 1.25), FOOD: 1.0, EXPORT: 1.05 });
        addLog('🏦 金利低下！お金を借りやすくなり、成長期待からIT株が大きく上がりました。', 'good');
        break;
      case 'NEWS_FX_YEN_DOWN':
        updatePrices({ IT: 1.0, FOOD: 0.95, EXPORT: getMultiplier(1.1, 1.2) });
        addLog('💴 円安進行！海外で稼ぐ輸出企業の利益が増えるため、自動車株が上がりました。（輸入頼みの食品は少しマイナス）', 'good');
        break;
      case 'NEWS_FX_YEN_UP':
        updatePrices({ IT: 1.0, FOOD: 1.05, EXPORT: getMultiplier(0.8, 0.9) });
        addLog('💴 円高進行！輸出企業の利益が目減りするため、自動車株が下がりました。', 'bad');
        break;
      case 'EVENT_IT_UP':
        updatePrices({ IT: getMultiplier(1.15, 1.3) });
        addLog('🏢 IT企業が革新的なAIサービスを発表！IT株が急騰しました！', 'good');
        break;
      case 'EVENT_IT_DOWN':
        updatePrices({ IT: getMultiplier(0.7, 0.85) });
        addLog('⚠️ IT企業で大規模なシステム障害発生！IT株が急落しました。', 'bad');
        break;
      case 'EVENT_FOOD_UP':
        updatePrices({ FOOD: getMultiplier(1.1, 1.2) });
        addLog('🍞 食品メーカーの健康飲料が大ヒット！食品株が上がりました。', 'good');
        break;
      case 'EVENT_FOOD_DOWN':
        updatePrices({ FOOD: getMultiplier(0.85, 0.95) });
        addLog('📉 食品メーカーで異物混入の噂。食品株が下がりました。', 'bad');
        break;
      case 'EVENT_EXPORT_UP':
        updatePrices({ EXPORT: getMultiplier(1.1, 1.2) });
        addLog('🚗 自動車メーカーの新型EVが世界中でバカ売れ！自動車株が上がりました。', 'good');
        break;
      case 'EVENT_ALL_RANDOM':
        updatePrices({
          IT: getMultiplier(0.8, 1.2),
          FOOD: getMultiplier(0.9, 1.1),
          EXPORT: getMultiplier(0.8, 1.2)
        });
        addLog('🗳️ 大統領選挙の結果発表！市場が混乱し、全ての株価がランダムに変動しました。', 'info');
        break;
      default:
        break;
    }
  };

  const applyMarketFluctuation = () => {
    let baseTrend = 1.0;
    if (economy === 'BOOM') baseTrend = 1.02;
    if (economy === 'RECESSION') baseTrend = 0.98;

    updatePrices({
      IT: getMultiplier(baseTrend - 0.05, baseTrend + 0.05),
      FOOD: getMultiplier(baseTrend - 0.01, baseTrend + 0.01),
      EXPORT: getMultiplier(baseTrend - 0.03, baseTrend + 0.03)
    });
  };

  const resetGame = () => {
    setGameState('PLAYING');
    setTurn(1);
    setCash(INITIAL_CASH);
    setHoldings({ IT: 0, FOOD: 0, EXPORT: 0 });
    setPrices({ IT: 1000, FOOD: 1000, EXPORT: 1000 });
    setPosition(0);
    setEconomy('NORMAL');
    setDiceResult(null);
    setLogs([{ turn: 0, msg: 'ゲームスタート！まずは株を買ってみましょう。', type: 'info' }]);
  };

  const totalAssets = cash + 
    (holdings.IT * prices.IT) + 
    (holdings.FOOD * prices.FOOD) + 
    (holdings.EXPORT * prices.EXPORT);

  const getRank = (assets) => {
    if (assets >= 3000000) return '👑 レジェンド投資家';
    if (assets >= 2000000) return '😎 プロ投資家';
    if (assets >= 1500000) return '🧐 堅実な投資家';
    if (assets >= 1000000) return '🐣 見習い投資家';
    return '😭 破産寸前...（やり直そう）';
  };

  // --- UIコンポーネント ---
  if (gameState === 'START') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">📊 インベスト・クエスト</h1>
          <p className="mb-6 text-gray-600">中学生から学べる！資産運用ボードゲーム</p>
          <div className="text-left bg-blue-50 p-4 rounded-lg mb-8 text-sm">
            <h2 className="font-bold mb-2">📜 ルール説明</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>あなたは初期資金100万円を持っています。</li>
              <li>「IT」「食品」「自動車」の3つの株を売買して資産を増やしましょう。</li>
              <li>サイコロを振るとコマが進み、経済ニュースが発生します。</li>
              <li>盤面のマスをクリックすると、そのイベントの経済的な意味が学べます！</li>
              <li>24ヶ月（24ターン）後の総資産額であなたの投資家ランクが決まります。</li>
            </ul>
          </div>
          <button 
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
          >
            ゲームスタート
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 p-2 md:p-4 gap-4">
      
      {/* 左パネル：ポートフォリオ、マーケット、ログ */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 max-h-[100dvh]">
        
        {/* ステータス */}
        <div className="bg-white p-4 rounded-xl shadow border-t-4 border-blue-500 shrink-0">
          <h2 className="text-lg font-bold mb-2 text-gray-700 flex justify-between">
            <span>ターン: {turn} / {MAX_TURNS}</span>
            <span className={`text-sm px-2 py-1 rounded ${economy === 'BOOM' ? 'bg-red-100 text-red-700' : economy === 'RECESSION' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
              景気: {economy === 'BOOM' ? '好景気 📈' : economy === 'RECESSION' ? '不景気 📉' : '平常 ➖'}
            </span>
          </h2>
          <div className="text-3xl font-black text-blue-600 mb-1">
            総資産: ¥{totalAssets.toLocaleString()}
          </div>
          <div className="text-gray-500 text-sm">
            （現金: ¥{cash.toLocaleString()}）
          </div>
        </div>

        {/* マーケット（売買） */}
        <div className="bg-white p-4 rounded-xl shadow shrink-0">
          <h2 className="text-lg font-bold mb-3 text-gray-700 border-b pb-1">株式マーケット</h2>
          <div className="space-y-3">
            {Object.keys(STOCKS).map(key => (
              <div key={key} className="p-2 border rounded-lg bg-slate-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold">{STOCKS[key].icon} {STOCKS[key].name}</div>
                  <div className="text-lg font-bold text-gray-800">¥{prices[key].toLocaleString()}</div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <div className="text-sm font-semibold">保有: <span className={holdings[key] > 0 ? 'text-blue-600' : ''}>{holdings[key]} 株</span></div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTrade(key, false)}
                      disabled={holdings[key] < 100 || gameState !== 'PLAYING'}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 text-sm font-bold"
                    >
                      売る
                    </button>
                    <button 
                      onClick={() => handleTrade(key, true)}
                      disabled={cash < prices[key] * 100 || gameState !== 'PLAYING'}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 text-sm font-bold"
                    >
                      買う
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ログ（左下に配置し、ここでスクロールを完結させる） */}
        <div className="bg-slate-800 text-slate-100 p-4 rounded-xl shadow flex-1 flex flex-col min-h-[150px] overflow-hidden">
          <h2 className="text-sm font-bold text-slate-400 mb-2 shrink-0">イベントログ</h2>
          <div ref={logContainerRef} className="overflow-y-auto flex-1 space-y-2 pr-2 text-sm font-mono pb-2">
            {logs.map((log, i) => (
              <div key={i} className={`border-l-4 pl-2 py-1 ${
                log.type === 'good' ? 'border-green-400 text-green-200' :
                log.type === 'bad' ? 'border-red-400 text-red-200' :
                log.type === 'trade' ? 'border-blue-400 text-blue-200' :
                log.type === 'event' ? 'border-purple-400 text-purple-200' :
                'border-gray-500 text-gray-300'
              }`}>
                {log.turn > 0 && <span className="opacity-50 mr-2">[M{log.turn}]</span>}
                {log.msg}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 右パネル：ボード（ハニカム）とアクション */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        
        {/* ボード表現（ハニカム配置） */}
        <div className="bg-white p-4 md:p-8 rounded-xl shadow flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b pb-2 shrink-0">
            <h2 className="text-lg font-bold text-gray-700">ワールドボード</h2>
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">💡 マスをクリックして経済を学ぼう</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* ハニカムコンテナ（アスペクト比を固定して配置） */}
            <div className="relative w-full max-w-[600px]" style={{ aspectRatio: '5 / 3.25' }}>
              {BOARD_SQUARES.map((sq, i) => {
                const pos = HEX_POSITIONS[i];
                return (
                  <div 
                    key={sq.id}
                    style={{
                      position: 'absolute',
                      left: `${(pos.c / 5) * 100}%`,
                      top: `${(pos.r * 0.75 / 3.25) * 100}%`,
                      width: `${100 / 5}%`,
                      height: `${100 / 3.25}%`,
                    }}
                    className="p-[1.5%]" // タイル間の隙間
                  >
                    <div 
                      onClick={() => setSelectedSquare(sq)}
                      className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm ${sq.color} ${position === i ? 'ring-inset ring-4 ring-blue-500 opacity-100' : 'opacity-80'}`}
                      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                      <div className="text-xl md:text-3xl mb-1">{sq.icon}</div>
                      <div className="text-[9px] md:text-xs font-bold leading-tight text-center px-1 md:px-3">
                        {sq.label}
                      </div>
                    </div>
                    {/* 現在地を示すピン */}
                    {position === i && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-6 md:-mt-8 text-3xl md:text-4xl drop-shadow-md z-10 pointer-events-none animate-bounce">
                        📍
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* アクションボタン（サイコロ） */}
        <div className="bg-white p-4 rounded-xl shadow shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              株の売買が終わったら<br/>サイコロ（2個）を振りましょう。
            </div>
            {/* サイコロの目表示 */}
            {diceResult && (
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center text-xl font-bold text-slate-700">
                  {diceResult.d1}
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center text-xl font-bold text-slate-700">
                  {diceResult.d2}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={rollDice}
            disabled={gameState !== 'PLAYING'}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xl flex items-center justify-center gap-2"
          >
            🎲 サイコロを振る
          </button>
        </div>

      </div>

      {/* 学習モーダル（マスをクリックしたとき） */}
      {selectedSquare && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setSelectedSquare(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up border-t-8 border-blue-500" 
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl text-center mb-2">{selectedSquare.icon}</div>
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-4">{selectedSquare.label}</h3>
            
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {selectedSquare.explanation}
              </p>
            </div>
            
            <button 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition" 
              onClick={() => setSelectedSquare(null)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ゲーム終了モーダル */}
      {gameState === 'END' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">ゲーム終了！</h2>
            <p className="text-gray-500 mb-6">2年（24ヶ月）の運用お疲れ様でした。</p>
            
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-1">最終総資産</p>
              <p className="text-4xl font-black text-blue-600">¥{totalAssets.toLocaleString()}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-1">あなたの投資家ランク</p>
              <p className="text-2xl font-bold text-orange-500">{getRank(totalAssets)}</p>
            </div>

            <button 
              onClick={resetGame}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow transition"
            >
              もう一度プレイする
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Target, Shield, TrendingUp, TrendingDown, 
  AlertTriangle, DollarSign 
} from 'lucide-react';

/**
 * ⚔️ ORDER EXECUTION PANEL - LETHAL PRECISION
 * 
 * NO EMOTIONS. NO HESITATION. ONLY EXECUTION.
 * 
 * Features:
 * - Risk-based position sizing
 * - ATR-based stop loss
 * - Multiple target management
 * - Real-time P&L calculation
 * - One-click execution
 */

interface OrderExecutionPanelProps {
  symbol: string;
  currentPrice: number;
  atr: number;
  accountBalance: number;
  maxRiskPercent?: number;
  onExecuteOrder: (order: OrderData) => void;
  className?: string;
}

interface OrderData {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopLoss: number;
  takeProfit: number[];
  riskAmount: number;
  riskRewardRatio: number;
  positionSize: number;
}

const OrderExecutionPanel: React.FC<OrderExecutionPanelProps> = ({
  symbol,
  currentPrice,
  atr,
  accountBalance,
  maxRiskPercent = 1,
  onExecuteOrder,
  className = ''
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [riskPercent, setRiskPercent] = useState(maxRiskPercent);
  const [stopLossMultiplier, setStopLossMultiplier] = useState(1.5);
  const [takeProfitMultipliers, setTakeProfitMultipliers] = useState([2, 4, 6]);
  const [isExecuting, setIsExecuting] = useState(false);

  // CALCULATE POSITION SIZE BASED ON RISK
  const calculatePositionSize = useCallback(() => {
    const riskAmount = accountBalance * (riskPercent / 100);
    const stopDistance = atr * stopLossMultiplier;
    const positionSize = riskAmount / stopDistance;
    
    return {
      positionSize,
      riskAmount,
      stopDistance,
      maxLoss: riskAmount
    };
  }, [accountBalance, riskPercent, atr, stopLossMultiplier]);

  // CALCULATE TARGET LEVELS
  const calculateTargets = useCallback(() => {
    const stopDistance = atr * stopLossMultiplier;
    const entry = currentPrice;
    const stopLoss = side === 'BUY' ? entry - stopDistance : entry + stopDistance;
    
    const targets = takeProfitMultipliers.map(multiplier => {
      const targetDistance = atr * multiplier;
      return side === 'BUY' ? entry + targetDistance : entry - targetDistance;
    });
    
    return { entry, stopLoss, targets };
  }, [currentPrice, atr, side, stopLossMultiplier, takeProfitMultipliers]);

  // CALCULATE RISK-REWARD RATIO
  const calculateRiskReward = useCallback(() => {
    const { entry, stopLoss, targets } = calculateTargets();
    const riskDistance = Math.abs(entry - stopLoss);
    
    if (targets.length === 0 || riskDistance === 0) return 0;
    
    const firstTarget = targets[0];
    if (firstTarget === undefined) return 0;
    
    const firstTargetDistance = Math.abs(firstTarget - entry);
    return firstTargetDistance / riskDistance;
  }, [calculateTargets]);

  // EXECUTE ORDER
  const executeOrder = useCallback(async () => {
    setIsExecuting(true);
    
    try {
      const { positionSize, riskAmount } = calculatePositionSize();
      const { entry, stopLoss, targets } = calculateTargets();
      const riskRewardRatio = calculateRiskReward();
      
      const order: OrderData = {
        symbol,
        side,
        quantity: positionSize,
        price: entry,
        stopLoss,
        takeProfit: targets,
        riskAmount,
        riskRewardRatio,
        positionSize
      };
      
      await onExecuteOrder(order);
    } finally {
      setIsExecuting(false);
    }
  }, [symbol, side, calculatePositionSize, calculateTargets, calculateRiskReward, onExecuteOrder]);

  const positionData = calculatePositionSize();
  const targetData = calculateTargets();
  const riskRewardRatio = calculateRiskReward();

  return (
    <div className={`bg-black border border-orange-500 rounded-lg p-4 font-mono ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <span className="text-orange-400 font-semibold">EXECUTION PANEL</span>
        </div>
        <div className="text-xs text-gray-400">
          {symbol} | ${currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Side Selection */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">DIRECTION:</div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSide('BUY')}
            className={`flex-1 py-2 px-4 rounded transition-all ${
              side === 'BUY' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 mx-auto" />
            <div className="text-xs mt-1">LONG</div>
          </button>
          <button
            onClick={() => setSide('SELL')}
            className={`flex-1 py-2 px-4 rounded transition-all ${
              side === 'SELL' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <TrendingDown className="w-4 h-4 mx-auto" />
            <div className="text-xs mt-1">SHORT</div>
          </button>
        </div>
      </div>

      {/* Risk Management */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">RISK MANAGEMENT:</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Risk %:</span>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-orange-400 w-8">
                {riskPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Stop Loss (ATR):</span>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={stopLossMultiplier}
                onChange={(e) => setStopLossMultiplier(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-orange-400 w-8">
                {stopLossMultiplier.toFixed(1)}x
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Take Profit Targets:</span>
            <div className="flex items-center space-x-1">
              {takeProfitMultipliers.map((multiplier, index) => (
                <input
                  key={index}
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={multiplier}
                  onChange={(e) => {
                    const newMultipliers = [...takeProfitMultipliers];
                    newMultipliers[index] = Number(e.target.value);
                    setTakeProfitMultipliers(newMultipliers);
                  }}
                  className="w-12 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-center"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Position Calculations */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">POSITION DETAILS:</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="text-orange-400">{positionData.positionSize.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Risk Amount:</span>
            <span className="text-red-400">${positionData.riskAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Stop Loss:</span>
            <span className="text-red-400">${targetData.stopLoss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Target 1:</span>
            <span className="text-green-400">
              ${targetData.targets && targetData.targets.length > 0 && targetData.targets[0] !== undefined 
                ? targetData.targets[0].toFixed(2) 
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>R:R Ratio:</span>
            <span className={`${riskRewardRatio >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
              1:{riskRewardRatio.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      {riskRewardRatio < 1.5 && (
        <div className="mb-4 p-2 bg-yellow-900/20 border border-yellow-500 rounded">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-400">
              Poor R:R ratio. Consider adjusting targets.
            </span>
          </div>
        </div>
      )}

      {/* Execute Button */}
      <motion.button
        onClick={executeOrder}
        disabled={isExecuting}
        className={`w-full py-3 px-4 rounded font-semibold transition-all ${
          side === 'BUY' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        } ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: isExecuting ? 1 : 1.02 }}
        whileTap={{ scale: isExecuting ? 1 : 0.98 }}
      >
        {isExecuting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>EXECUTING...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Target className="w-4 h-4" />
            <span>EXECUTE {side}</span>
          </div>
        )}
      </motion.button>

      {/* Account Summary */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Balance:</span>
          </div>
          <span className="text-green-400">${accountBalance.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Max Risk:</span>
          </div>
          <span className="text-orange-400">${(accountBalance * maxRiskPercent / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderExecutionPanel;

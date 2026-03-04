import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Slider,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

interface ScenarioData {
  baseDemand: number;
  baseSupply: number;
  unitCost: number;
  holdingCostRate: number; // e.g., 0.15 for 15% of unit cost per period
  stockoutCostRate: number; // e.g., 0.20 for 20% of unit cost per period (penalty or lost margin)
  maxStockLevel: number; // Max inventory capacity
  minSafetyStock: number; // Target safety stock
}

// Sample base data
const initialScenarioData: ScenarioData = {
  baseDemand: 1000,
  baseSupply: 950,
  unitCost: 50,
  holdingCostRate: 0.02, // 2% of unit cost per month
  stockoutCostRate: 0.10, // 10% of unit cost per stockout unit
  maxStockLevel: 1500,
  minSafetyStock: 100,
};

/**
 * Calculates Key Performance Indicators (KPIs) based on scenario parameters.
 * @param demandMultiplier The multiplier applied to base demand.
 * @param data Base scenario data.
 */
const calculateKpis = (demandMultiplier: number, data: ScenarioData) => {
  const adjustedDemand = Math.round(data.baseDemand * demandMultiplier);
  const availableSupply = data.baseSupply; // Assuming supply is less flexible in short-term scenario

  // Calculate Carrying Cost
  // Simplified: assumes average inventory is proportional to supply or a target level.
  // For a more accurate model, one would need inventory levels over time.
  // Here, we assume carrying cost based on maintaining a certain stock level related to supply.
  const estimatedInventory = Math.min(availableSupply + data.minSafetyStock, data.maxStockLevel); // Simple estimate
  const carryingCost = estimatedInventory * data.unitCost * data.holdingCostRate;

  // Calculate Stockout Risk %
  // If adjusted demand exceeds available supply, there's a risk of stockout.
  const potentialStockoutUnits = Math.max(0, adjustedDemand - availableSupply);
  const stockoutRiskPercentage = Math.min(100, (potentialStockoutUnits / adjustedDemand) * 100);

  // Calculate Service Level %
  // Service level is often 1 - (number of stockouts / number of demand events)
  // Here, simplified: higher supply coverage relative to demand means higher service level.
  const serviceLevelPercentage = Math.min(100, Math.max(0, (availableSupply / adjustedDemand) * 100));

  return {
    adjustedDemand,
    potentialStockoutUnits,
    carryingCost: carryingCost,
    stockoutRiskPercentage: stockoutRiskPercentage,
    serviceLevelPercentage: serviceLevelPercentage,
  };
};

/**
 * A component for simulating S&OP scenarios with demand multiplier adjustment.
 * Displays real-time KPI calculations like carrying cost, stockout risk, and service level.
 */
const ScenarioSimulator: React.FC = () => {
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);

  const kpis = useMemo(() => calculateKpis(demandMultiplier, initialScenarioData), [demandMultiplier]);

  const handleSliderChange = useCallback((_event: Event, newValue: number | number[]) => {
    setDemandMultiplier(newValue as number);
  }, []);

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Scenario Simulation Engine
      </Typography>

      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography gutterBottom>Demand Multiplier: {demandMultiplier.toFixed(2)}x</Typography>
        <Slider
          value={demandMultiplier}
          onChange={handleSliderChange}
          aria-labelledby="demand-multiplier-slider"
          valueLabelDisplay="auto"
          step={0.05}
          marks
          min={0.5}
          max={2.0}
          sx={{ width: '90%', mx: 'auto' }}
        />
      </Box>

      <Typography variant="h5" gutterBottom>Key Performance Indicators</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <List>
            <ListItem>
              <ListItemIcon><Typography variant="h6">🧮</Typography></ListItemIcon>
              <ListItemText
                primary="Adjusted Demand"
                secondary={initialScenarioData.baseDemand.toLocaleString()} // Base value
              />
              <Typography color="primary" variant="h6">{kpis.adjustedDemand.toLocaleString()} units</Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon><StorageIcon color="action" /></ListItemIcon>
              <ListItemText
                primary="Carrying Cost"
                secondary="Estimated holding cost for inventory"
              />
              <Typography color="text.secondary" variant="h6">{formatCurrency(kpis.carryingCost)} / month</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <List>
            <ListItem>
              <ListItemIcon><WarningIcon color={kpis.stockoutRiskPercentage > 10 ? "error" : "warning"} /></ListItemIcon>
              <ListItemText
                primary="Stockout Risk %"
                secondary="Probability of not meeting demand"
              />
              <Typography color={kpis.stockoutRiskPercentage > 10 ? "error" : "warning"} variant="h6">{formatPercentage(kpis.stockoutRiskPercentage)}</Typography>
            </ListItem>
            <ListItem>
              <ListItemIcon><SentimentVerySatisfiedIcon color={kpis.serviceLevelPercentage > 90 ? "success" : "warning"} /></ListItemIcon>
              <ListItemText
                primary="Service Level %"
                secondary="Percentage of demand met by supply"
              />
              <Typography color={kpis.serviceLevelPercentage > 90 ? "success" : "warning"} variant="h6">{formatPercentage(kpis.serviceLevelPercentage)}</Typography>
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Based on initial data: Base Demand {initialScenarioData.baseDemand.toLocaleString()} units, 
          Base Supply {initialScenarioData.baseSupply.toLocaleString()} units, 
          Unit Cost {formatCurrency(initialScenarioData.unitCost)}. 
          (Note: This is a simplified model for demonstration purposes.)
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScenarioSimulator;

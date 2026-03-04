import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider, Paper, Grid, TextField } from '@mui/material';

interface ScenarioSimulatorProps {
  initialDemand: number;
  initialSupply: number;
  initialForecastAccuracy: number; // e.g., MAPE or WAPE
  onValuesChange?: (kpis: KpiReadouts) => void;
}

interface KpiReadouts {
  simulatedDemand: number;
  simulatedSupply: number;
  demandMultiplier: number;
  supplyMultiplier: number;
  demandSupplyGap: number;
  inventoryLevel: number; // This would typically be calculated based on demand/supply over time
  revenueImpact: number; // Example KPI
  profitImpact: number; // Example KPI
}

const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  initialDemand,
  initialSupply,
  initialForecastAccuracy,
  onValuesChange,
}) => {
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [supplyMultiplier, setSupplyMultiplier] = useState<number>(1.0);
  const [kpis, setKpis] = useState<KpiReadouts>({
    simulatedDemand: initialDemand,
    simulatedSupply: initialSupply,
    demandMultiplier: 1.0,
    supplyMultiplier: 1.0,
    demandSupplyGap: initialDemand - initialSupply,
    inventoryLevel: initialSupply - initialDemand, // Simplified
    revenueImpact: 0,
    profitImpact: 0,
  });

  // Example base value for revenue/profit impact calculations
  const baseUnitRevenue = 100; // $100 per unit
  const baseUnitCost = 60; // $60 per unit

  const calculateKpis = useCallback((demMult: number, supMult: number) => {
    const currentSimulatedDemand = initialDemand * demMult;
    const currentSimulatedSupply = initialSupply * supMult;
    const currentDemandSupplyGap = currentSimulatedDemand - currentSimulatedSupply;
    const currentInventoryLevel = currentSimulatedSupply - currentSimulatedDemand; // Simple backlog/surplus

    // Simplified revenue/profit impact. In a real app, this would be far more complex.
    // Assuming revenue is capped by supply or demand if demand < supply
    const unitsSold = Math.min(currentSimulatedDemand, currentSimulatedSupply);
    const currentRevenueImpact = unitsSold * baseUnitRevenue - initialSupply * baseUnitRevenue; // Change from initial supply-based revenue
    const currentProfitImpact = (unitsSold * (baseUnitRevenue - baseUnitCost)) - (initialSupply * (baseUnitRevenue - baseUnitCost));

    return {
      simulatedDemand: currentSimulatedDemand,
      simulatedSupply: currentSimulatedSupply,
      demandMultiplier: demMult,
      supplyMultiplier: supMult,
      demandSupplyGap: currentDemandSupplyGap,
      inventoryLevel: currentInventoryLevel,
      revenueImpact: currentRevenueImpact,
      profitImpact: currentProfitImpact,
    };
  }, [initialDemand, initialSupply, baseUnitRevenue, baseUnitCost]);

  useEffect(() => {
    const newKpis = calculateKpis(demandMultiplier, supplyMultiplier);
    setKpis(newKpis);
    if (onValuesChange) {
      onValuesChange(newKpis);
    }
  }, [demandMultiplier, supplyMultiplier, calculateKpis, onValuesChange]);

  const handleDemandMultiplierChange = (_event: Event, newValue: number | number[]) => {
    setDemandMultiplier(newValue as number);
  };

  const handleSupplyMultiplierChange = (_event: Event, newValue: number | number[]) => {
    setSupplyMultiplier(newValue as number);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Scenario Simulator</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Adjust demand and supply multipliers to see their impact on key performance indicators.
      </Typography>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Demand Multiplier ({demandMultiplier.toFixed(2)}x)</Typography>
          <Slider
            value={demandMultiplier}
            onChange={handleDemandMultiplierChange}
            aria-labelledby="demand-multiplier-slider"
            valueLabelDisplay="auto"
            step={0.05}
            marks
            min={0.5}
            max={2.0}
          />
          <TextField
            label="Current Demand"
            value={kpis.simulatedDemand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            InputProps={{ readOnly: true }}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Supply Multiplier ({supplyMultiplier.toFixed(2)}x)</Typography>
          <Slider
            value={supplyMultiplier}
            onChange={handleSupplyMultiplierChange}
            aria-labelledby="supply-multiplier-slider"
            valueLabelDisplay="auto"
            step={0.05}
            marks
            min={0.5}
            max={2.0}
          />
          <TextField
            label="Current Supply"
            value={kpis.simulatedSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            InputProps={{ readOnly: true }}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Live KPI Readouts</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Demand-Supply Gap"
            value={kpis.demandSupplyGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            InputProps={{ readOnly: true }}
            fullWidth
            variant="filled"
            color={kpis.demandSupplyGap > 0 ? 'error' : 'success'}
            sx={{ bgcolor: kpis.demandSupplyGap > 0 ? 'error.light' : (kpis.demandSupplyGap < 0 ? 'success.light' : 'background.paper') }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Inventory Level / Backlog"
            value={kpis.inventoryLevel.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            InputProps={{ readOnly: true }}
            fullWidth
            variant="filled"
            color={kpis.inventoryLevel < 0 ? 'error' : 'success'}
            sx={{ bgcolor: kpis.inventoryLevel < 0 ? 'error.light' : (kpis.inventoryLevel > 0 ? 'success.light' : 'background.paper') }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Initial Forecast Accuracy (MAPE)"
            value={`${initialForecastAccuracy.toFixed(2)}%`}
            InputProps={{ readOnly: true }}
            fullWidth
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Revenue Impact"
            value={`$${kpis.revenueImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            InputProps={{ readOnly: true }}
            fullWidth
            variant="filled"
            color={kpis.revenueImpact < 0 ? 'error' : 'success'}
            sx={{ bgcolor: kpis.revenueImpact < 0 ? 'error.light' : (kpis.revenueImpact > 0 ? 'success.light' : 'background.paper') }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Profit Impact"
            value={`$${kpis.profitImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            InputProps={{ readOnly: true }}
            fullWidth
            variant="filled"
            color={kpis.profitImpact < 0 ? 'error' : 'success'}
            sx={{ bgcolor: kpis.profitImpact < 0 ? 'error.light' : (kpis.profitImpact > 0 ? 'success.light' : 'background.paper') }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ScenarioSimulator;
export type { KpiReadouts };

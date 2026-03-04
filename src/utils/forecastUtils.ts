/**
 * Calculates the Mean Absolute Percentage Error (MAPE).
 * MAPE measures the accuracy of forecasting systems. It expresses the accuracy as a percentage.
 * Lower MAPE values indicate better forecast accuracy.
 *
 * The formula for MAPE is: (1 / n) * Σ(|Actual - Forecast| / |Actual|) * 100
 * where:
 * - n is the number of data points
 * - Actual is the actual observed value
 * - Forecast is the forecasted value
 *
 * @param actuals An array of actual observed values.
 * @param forecasts An array of forecasted values.
 * @returns The Mean Absolute Percentage Error (MAPE) as a percentage, rounded to the nearest integer.
 *          Returns 0 if no data points are provided or if all actuals are zero (to avoid division by zero issues in a practical sense).
 *          Returns Infinity if encountering division by zero with non-zero forecast (edge case).
 */
export function calculateMAPE(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) {
    // Handle cases where arrays are empty or have different lengths
    if (actuals.length !== forecasts.length) {
      console.warn("Warning: Actuals and Forecasts arrays have different lengths. MAPE calculation might be inaccurate.");
    }
    return 0; // No data points to calculate MAPE
  }

  let sumAbsolutePercentageError = 0;
  let validComparisons = 0;

  for (let i = 0; i < actuals.length; i++) {
    const actual = actuals[i];
    const forecast = forecasts[i];

    if (actual === 0) {
      // If actual is 0 and forecast is also 0, error is 0. If forecast is not 0, it's an undefined error
      // In practice, this point is often excluded or handled specially. For simplicity, we exclude.
      // Or, we could consider infinite error, but this skews average heavily.
      // For percentage-based error, division by zero is problematic. Excluding is a common pragmatic approach.
      // Alternatively, one might use a small epsilon or another metric like MASE (Mean Absolute Scaled Error).
      // For this function, we'll skip points where actual is 0 to prevent division by zero.
      if (forecast !== 0) {
        // If actual is 0 but forecast is not 0, this is a very large error typically. 
        // For MAPE, excluding or reporting special value is common.
        // If you need to include, consider a different error metric.
        console.warn(`Warning: Actual value is 0 at index ${i}. Skipping this point for MAPE calculation.`);
      }
      continue;
    }

    const absolutePercentageError = Math.abs((actual - forecast) / actual);
    sumAbsolutePercentageError += absolutePercentageError;
    validComparisons++;
  }

  if (validComparisons === 0) {
    return 0; // All actuals were zero, or no valid comparisons.
  }

  const mape = (sumAbsolutePercentageError / validComparisons) * 100;

  // Using Math.round instead of Math.floor for proper percentage rounding.
  return Math.round(mape);
}

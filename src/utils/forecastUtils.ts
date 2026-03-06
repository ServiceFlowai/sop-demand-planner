/**
 * Calculates the Mean Absolute Percentage Error (MAPE) for a given set of actual and forecast values.
 * MAPE is a measure of prediction accuracy of a forecasting method in statistics.
 * It expresses accuracy as a percentage, and is defined by the formula:
 * MAPE = (1/n) * Σ(|Actual - Forecast| / |Actual|) * 100
 * where: n is the number of data points, Actual is the actual value, and Forecast is the forecast value.
 *
 * @param actuals An array of actual observed values.
 * @param forecasts An array of forecasted values, corresponding to the actuals.
 * @returns The Mean Absolute Percentage Error as a number, or NaN if inputs are invalid or `actuals` contains zero values.
 *          Returns 0 if `actuals` is empty or all errors are 0.
 */
export function calculateMAPE(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) {
    return NaN;
  }

  let sumAbsolutePercentageError = 0;
  let dataPointCount = 0;

  for (let i = 0; i < actuals.length; i++) {
    const actual = actuals[i];
    const forecast = forecasts[i];

    if (actual === 0) {
      // MAPE is undefined or infinite when actuals are zero.
      // Common approaches: exclude the point, or handle as a special case.
      // For this implementation, we will exclude these points from the calculation
      // as per common practice to avoid division by zero which would skew the result to infinity.
      console.warn(`Actual value at index ${i} is zero. This point will be excluded from MAPE calculation.`);
      continue;
    }

    const absolutePercentageError = Math.abs((actual - forecast) / actual);
    sumAbsolutePercentageError += absolutePercentageError;
    dataPointCount++;
  }

  if (dataPointCount === 0) {
    // If all actuals were zero or no valid data points found
    return 0; // Or NaN, depending on desired behavior for entirely zero actuals array
  }

  // Round the final result before multiplying by 100 to avoid floating point issues
  // and to provide a cleaner percentage value.
  const mape = (sumAbsolutePercentageError / dataPointCount) * 100;
  return Math.round(mape * 100) / 100; // Round to 2 decimal places for presentation
}

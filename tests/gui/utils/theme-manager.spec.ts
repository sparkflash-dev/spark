import { expect } from 'chai';
import { SPARK_DARK, SPARK_LIGHT, getThemeCSS } from '../../../lib/gui/app/utils/theme-manager';

describe('Theme Manager', () => {
  it('should have dark theme with correct name', () => {
    expect(SPARK_DARK.name).to.equal('Spark Dark');
    expect(SPARK_DARK.isDark).to.be.true;
  });

  it('should have light theme with correct name', () => {
    expect(SPARK_LIGHT.name).to.equal('Spark Light');
    expect(SPARK_LIGHT.isDark).to.be.false;
  });

  it('should generate valid CSS variables', () => {
    const css = getThemeCSS(SPARK_DARK);
    expect(css).to.include(':root');
    expect(css).to.include('--spark-primary');
    expect(css).to.include('--spark-background');
  });

  it('should have different backgrounds for light and dark', () => {
    expect(SPARK_DARK.colors.background).to.not.equal(SPARK_LIGHT.colors.background);
  });
});

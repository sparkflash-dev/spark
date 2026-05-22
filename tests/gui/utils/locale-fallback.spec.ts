import { expect } from 'chai';
import { resolveLocaleAlias, isRTL, getTextDirection, getWritingSystem, getFontRecommendation, getLanguageFromLocale } from '../../../lib/gui/app/utils/locale-fallback';

describe('Locale Fallback', () => {
  it('should resolve zh-Hans to zh-CN', () => {
    expect(resolveLocaleAlias('zh-Hans')).to.equal('zh-CN');
  });

  it('should resolve pt-BR to pt', () => {
    expect(resolveLocaleAlias('pt-BR')).to.equal('pt');
  });

  it('should pass through unknown locales', () => {
    expect(resolveLocaleAlias('sv')).to.equal('sv');
  });

  it('should detect RTL languages', () => {
    expect(isRTL('ar')).to.be.true;
    expect(isRTL('he')).to.be.true;
    expect(isRTL('en')).to.be.false;
  });

  it('should return text direction', () => {
    expect(getTextDirection('ar-SA')).to.equal('rtl');
    expect(getTextDirection('en-US')).to.equal('ltr');
  });

  it('should detect CJK writing system', () => {
    expect(getWritingSystem('zh')).to.equal('CJK');
    expect(getWritingSystem('ja')).to.equal('CJK');
    expect(getWritingSystem('ko')).to.equal('CJK');
  });

  it('should recommend CJK fonts for Chinese', () => {
    expect(getFontRecommendation('zh')).to.include('CJK');
  });

  it('should extract language from locale', () => {
    expect(getLanguageFromLocale('en-US')).to.equal('en');
    expect(getLanguageFromLocale('zh_CN')).to.equal('zh');
  });
});

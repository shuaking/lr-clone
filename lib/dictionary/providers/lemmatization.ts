/**
 * 词形变化识别提供商
 * 使用简单的规则识别英语单词的原形和变形
 */

import { DictionaryProvider, DictionaryResult, WordLemma } from '../types';

export class LemmatizationProvider implements DictionaryProvider {
  name = 'lemmatization';

  // 常见不规则动词
  private irregularVerbs: Record<string, string> = {
    'was': 'be', 'were': 'be', 'been': 'be', 'being': 'be',
    'had': 'have', 'has': 'have', 'having': 'have',
    'did': 'do', 'does': 'do', 'done': 'do', 'doing': 'do',
    'went': 'go', 'gone': 'go', 'going': 'go',
    'saw': 'see', 'seen': 'see', 'seeing': 'see',
    'took': 'take', 'taken': 'take', 'taking': 'take',
    'came': 'come', 'coming': 'come',
    'made': 'make', 'making': 'make',
    'got': 'get', 'gotten': 'get', 'getting': 'get',
    'gave': 'give', 'given': 'give', 'giving': 'give',
    'found': 'find', 'finding': 'find',
    'told': 'tell', 'telling': 'tell',
    'thought': 'think', 'thinking': 'think',
    'knew': 'know', 'known': 'know', 'knowing': 'know',
    'felt': 'feel', 'feeling': 'feel',
    'left': 'leave', 'leaving': 'leave',
    'kept': 'keep', 'keeping': 'keep',
    'meant': 'mean', 'meaning': 'mean',
    'brought': 'bring', 'bringing': 'bring',
    'began': 'begin', 'begun': 'begin', 'beginning': 'begin',
    'ran': 'run', 'running': 'run',
    'wrote': 'write', 'written': 'write', 'writing': 'write',
    'sat': 'sit', 'sitting': 'sit',
    'stood': 'stand', 'standing': 'stand',
    'heard': 'hear', 'hearing': 'hear',
    'let': 'let', 'letting': 'let',
    'put': 'put', 'putting': 'put',
    'became': 'become', 'becoming': 'become',
    'held': 'hold', 'holding': 'hold',
    'spoke': 'speak', 'spoken': 'speak', 'speaking': 'speak',
    'fell': 'fall', 'fallen': 'fall', 'falling': 'fall',
    'ate': 'eat', 'eaten': 'eat', 'eating': 'eat',
    'understood': 'understand', 'understanding': 'understand',
    'met': 'meet', 'meeting': 'meet',
    'led': 'lead', 'leading': 'lead',
    'read': 'read', 'reading': 'read',
    'lost': 'lose', 'losing': 'lose',
    'paid': 'pay', 'paying': 'pay',
    'sent': 'send', 'sending': 'send',
    'built': 'build', 'building': 'build',
    'spent': 'spend', 'spending': 'spend',
    'cut': 'cut', 'cutting': 'cut',
    'grew': 'grow', 'grown': 'grow', 'growing': 'grow',
    'sold': 'sell', 'selling': 'sell',
    'wore': 'wear', 'worn': 'wear', 'wearing': 'wear',
    'won': 'win', 'winning': 'win',
    'chose': 'choose', 'chosen': 'choose', 'choosing': 'choose',
    'fought': 'fight', 'fighting': 'fight',
    'caught': 'catch', 'catching': 'catch',
    'taught': 'teach', 'teaching': 'teach',
    'bought': 'buy', 'buying': 'buy',
    'sought': 'seek', 'seeking': 'seek',
    'drew': 'draw', 'drawn': 'draw', 'drawing': 'draw',
    'broke': 'break', 'broken': 'break', 'breaking': 'break',
    'threw': 'throw', 'thrown': 'throw', 'throwing': 'throw',
    'forgot': 'forget', 'forgotten': 'forget', 'forgetting': 'forget',
    'lay': 'lie', 'lain': 'lie', 'lying': 'lie',
    'rode': 'ride', 'ridden': 'ride', 'riding': 'ride',
    'sang': 'sing', 'sung': 'sing', 'singing': 'sing',
    'swam': 'swim', 'swum': 'swim', 'swimming': 'swim',
    'flew': 'fly', 'flown': 'fly', 'flying': 'fly',
    'drove': 'drive', 'driven': 'drive', 'driving': 'drive',
    'shook': 'shake', 'shaken': 'shake', 'shaking': 'shake',
    'hid': 'hide', 'hidden': 'hide', 'hiding': 'hide',
    'froze': 'freeze', 'frozen': 'freeze', 'freezing': 'freeze',
    'bit': 'bite', 'bitten': 'bite', 'biting': 'bite',
    'blew': 'blow', 'blown': 'blow', 'blowing': 'blow',
    'drank': 'drink', 'drunk': 'drink', 'drinking': 'drink',
    'rang': 'ring', 'rung': 'ring', 'ringing': 'ring',
    'sank': 'sink', 'sunk': 'sink', 'sinking': 'sink',
    'stole': 'steal', 'stolen': 'steal', 'stealing': 'steal',
    'tore': 'tear', 'torn': 'tear', 'tearing': 'tear',
    'woke': 'wake', 'woken': 'wake', 'waking': 'wake'
  };

  async lookup(word: string, language: string): Promise<Partial<DictionaryResult>> {
    // 目前只支持英语
    if (language !== 'en') {
      return {};
    }

    const lowerWord = word.toLowerCase();
    const lemma = this.findLemma(lowerWord);

    if (!lemma) {
      return {};
    }

    return {
      lemma: {
        lemma,
        forms: this.generateForms(lemma)
      },
      sources: [this.name]
    };
  }

  private findLemma(word: string): string {
    // 检查不规则动词
    if (this.irregularVerbs[word]) {
      return this.irregularVerbs[word];
    }

    // 规则变化
    // 复数名词 -> 单数
    if (word.endsWith('ies') && word.length > 4) {
      return word.slice(0, -3) + 'y';
    }
    if (word.endsWith('es') && word.length > 3) {
      const base = word.slice(0, -2);
      if (base.endsWith('s') || base.endsWith('x') || base.endsWith('z') ||
          base.endsWith('ch') || base.endsWith('sh')) {
        return base;
      }
      return word.slice(0, -1);
    }
    if (word.endsWith('s') && word.length > 2 && !word.endsWith('ss')) {
      return word.slice(0, -1);
    }

    // 动词过去式/过去分词 -> 原形
    if (word.endsWith('ed') && word.length > 3) {
      const base = word.slice(0, -2);
      // 双写辅音字母
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        return base.slice(0, -1);
      }
      return base;
    }

    // 现在分词 -> 原形
    if (word.endsWith('ing') && word.length > 4) {
      const base = word.slice(0, -3);
      // 双写辅音字母
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        return base.slice(0, -1);
      }
      // 去掉 e
      if (base.endsWith('e')) {
        return base;
      }
      return base + 'e';
    }

    // 形容词比较级/最高级 -> 原形
    if (word.endsWith('er') && word.length > 3) {
      return word.slice(0, -2);
    }
    if (word.endsWith('est') && word.length > 4) {
      return word.slice(0, -3);
    }

    // 副词 -> 形容词
    if (word.endsWith('ly') && word.length > 3) {
      return word.slice(0, -2);
    }

    return word;
  }

  private generateForms(lemma: string): string[] {
    const forms: string[] = [lemma];

    // 生成常见变形
    // 第三人称单数
    if (lemma.endsWith('y') && lemma.length > 2) {
      forms.push(lemma.slice(0, -1) + 'ies');
    } else if (lemma.endsWith('s') || lemma.endsWith('x') || lemma.endsWith('z') ||
               lemma.endsWith('ch') || lemma.endsWith('sh')) {
      forms.push(lemma + 'es');
    } else {
      forms.push(lemma + 's');
    }

    // 过去式/过去分词
    if (lemma.endsWith('e')) {
      forms.push(lemma + 'd');
    } else {
      forms.push(lemma + 'ed');
    }

    // 现在分词
    if (lemma.endsWith('e') && lemma.length > 2) {
      forms.push(lemma.slice(0, -1) + 'ing');
    } else {
      forms.push(lemma + 'ing');
    }

    return [...new Set(forms)]; // 去重
  }

  async isAvailable(): Promise<boolean> {
    return true; // 本地规则，始终可用
  }

  getSupportedLanguages(): string[] {
    return ['en'];
  }
}

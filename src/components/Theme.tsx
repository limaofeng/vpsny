import React from 'react';

export default interface Theme {
  colors: {
    /**
     * 可用于导航条/文本的背景
     */
    backgroundColorDeeper: string;
    /**
     * 默认背景
     */
    backgroundColor: string;
    /**
     * 3. 次级文字
     */
    trivial: string;
    /**
     * 2. 标题颜色
     */
    minor: string;
    /**
     * 由于 minor 太浅，有些场合并不适用
     */
    secondary: string;
    /**
     * 1. 重要文字显示
     */
    major: string;
    /**
     * 主色调 - 主要图标与内容
     */
    primary: string;
    /**
     * 多彩
     */
    colorful: {
      green: string;
      purple: string;
      darkBlue: string;
      orange: string;
      red: string;
      iron: string;
      /**
       * 只用于服务器的 Pending 状态灯颜色
       */
      geraldine: string;
    };
  };
  fonts: {
    /**
     * 巨大 - 28 pt
     */
    huge: {
      fontSize: number;
      fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    };
    /**
     * 标题 - 18 pt
     */
    title: {
      fontSize: number;
    };
    /**
     * 标题 - 14pt
     */
    callout: {
      fontSize: number;
    };
    /**
     * 标题 - 13pt
     */
    headline: {
      fontSize: number;
    };
    /**
     * 正文 - 13pt
     */
    body: {
      fontSize: number;
    };
    /**
     * 注脚 12pt
     */
    footnote: {
      fontSize: number;
    };
    /**
     * 小标题 -  11pt
     */
    subhead: {
      fontSize: number;
    };
    /**
     * 说明 - 10 pt
     */
    caption: {
      fontSize: number;
    };
  };
}

export const defaultTheme: Theme = {
  colors: {
    /**
     * 可用于导航条/文本的背景
     */
    backgroundColorDeeper: '#FEFFFF',
    /**
     * 默认背景
     */
    backgroundColor: '#F0F1F2',
    /**
     * 次级文字
     */
    trivial: '#CBCCCD',
    /**
     * 标题颜色
     */
    minor: '#A7A8AC',
    /**
     * 重要文字显示 - 比如输入内容
     */
    major: '#444444',
    /**
     * 由于 minor 太浅，有些场合并不适用
     */
    secondary: '#767676',
    /**
     * 主色调 - 主要图标与内容
     */
    primary: '#4180EE',
    colorful: {
      green: '#1FC700',
      purple: '#8641F4',
      orange: '#F5BC0C',
      darkBlue: '#44239A',
      red: '#E43934',
      iron: '#d2d8dc',
      geraldine: '#E17108'
    }
  },
  fonts: {
    huge: {
      fontSize: 28,
      fontWeight: 'bold'
    },
    title: {
      fontSize: 16
    },
    callout: {
      fontSize: 14
    },
    headline: {
      fontSize: 13
    },
    body: {
      fontSize: 13
    },
    footnote: {
      fontSize: 12
    },
    subhead: {
      fontSize: 11
    },
    caption: {
      fontSize: 10
    }
  }
};

export const ThemeContext = React.createContext(defaultTheme);

export class ThemeProvider extends React.Component {
  state = { theme: 'light' };

  render() {
    return <ThemeContext.Provider value={defaultTheme}>{this.props.children}</ThemeContext.Provider>;
  }
}

export function withTheme<T extends React.Component, P>(
  Component: new (props: P, context?: any) => T,
  forwardRef?: boolean
): new (props: P, context?: any) => T {
  function ThemedComponent({ forwardedRef, ...props }: any) {
    return (
      <ThemeContext.Consumer>
        {theme => <Component ref={forwardedRef} {...props} theme={theme} />}
      </ThemeContext.Consumer>
    );
  }
  for (const property of Object.keys(Component)) {
    if (property === 'getDerivedStateFromProps') {
      continue;
    }
    ThemedComponent[property] = Component[property];
  }
  if (forwardRef === undefined || forwardRef === true) {
    return React.forwardRef((props, ref) => <ThemedComponent {...props} forwardedRef={ref} />);
  }
  return ThemedComponent;
}

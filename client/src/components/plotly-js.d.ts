declare module 'plotly.js' {
  export interface Figure {
    data: Data[];
    layout?: Partial<Layout>;
    frames?: Frame[];
  }
  
  export interface Data {
    type: string;
    [key: string]: any;
  }
  
  export interface Layout {
    [key: string]: any;
  }
  
  export interface Frame {
    [key: string]: any;
  }
  
  export interface Config {
    [key: string]: any;
  }
} 
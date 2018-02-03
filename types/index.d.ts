declare module 'mqxliff' {
  interface TU {
    status(): string;
    matchRate(): number;
    srcPlain(): string;
    trgPlain(txt?: string): string;
  }

  interface TDocInfo {
    srcLang: string;
    trgLang: string;
    docName: string;
    tuCount: number;
  }

  /** Represents a translation document. */
  interface TDoc {
    info(): TDocInfo;
    getTU(ix: number): TU;
    writeXliff(): string;
    writeJson(): string;
  }

  /**
   * Parses a memoQ bilingual XLIFF file.
   * @param xliffstr The MQXLIFF (an XML file) as string.
   */
  function mqxliff(xliffstr: string) : TDoc;
  export = mqxliff;
}

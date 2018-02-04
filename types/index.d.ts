declare module 'mqxliff' {

  /** The content type of a single [[ContentRun]] within a [[FormatRange]]. */
  enum RunType {
    /** The run contains text. */
    Text = "Text",
    /** The run is a single structural tag, like "{1}". */
    StructuralTag = "StructuralTag",
    /** The run is a single opening inline tag. */
    OpenTag = "OpenTag",
    /** The run is a single empty inline tag. */
    EmptyTag = "EmptyTag",
    /** The run is a single closing inline tag. */
    CloseTag = "CloseTag"
  }

  /** An attribute-value pair within an inline tag. */
  interface AttrVal {
    /** Attribue name. */
    attr: string;
    /** Attribute value. */
    val: string;
  }

  /** A single content run within a [[FormatRange]]. */
  interface ContentRun {
    /** This run's type (text, or a single tag). */
    type: RunType;
  }

  /** A content run that contains text. */
  interface Text extends ContentRun {
    /** The text of this run. */
    text: string;
  }

  /** A content run that represents a single structural tag. */
  interface StructuralTag extends ContentRun { }

  /**
   * A content run that represents a single inline tag. 
   * The type of the tag (open/empty/close) is defined by the inherited [[ContentRun.type]] field.
   */
  interface InlineTag extends ContentRun {
    /** The name of the inline tag. */
    name: string;
    /**
     * The inline tag's attributes, if any; otherwise, an empty array.
     * Keep in mind that in memoQ's data model, closing tags can have attributes too.
     */
    attrs: AttrVal[];
  }

  /** 
   * A single range of formatted text within a segment. The range has uniform formatting (b/i/u/s/s).
   * A range is made up of one or more content runs, which represent either text or tags.
   */
  interface FormatRange {
    /** Whether or not the range has bold formatting. */
    bold: boolean;
    /** Whether or not the range has italic formatting. */
    italic: boolean;
    /** Whether or not the range has underline formatting. */
    underlined: boolean;
    /** Whether or not the range has subscript formatting. */
    subscript: boolean;
    /** Whether or not the range has superscript formatting. */
    superscript: boolean;
    /**
     * One or more runs that make up this range: i.e., the text and/or tags within the range.
     */
    content: ContentRun[];
  }

  /**
   * The different statuses that a translation unit can have in a memoQ translation document.
   * These values correspond to the colors seen at the right of each row in memoQ's translation grid.
   */
  enum TUStatus {
    NotStarted = "NotStarted",
    PreTranslated = "PreTranslated",
    PartiallyEdited = "PartiallyEdited",
    ManuallyConfirmed = "ManuallyConfirmed",
    Reviewer1Confirmed = "Reviewer1Confirmed",
    AssembledFromFragments = "AssembledFromFragments",
    Proofread = "Proofread",
    MachineTranslated = "MachineTranslated",
    Rejected = "Rejected"
  }

  /**
   * A single translation unit from the translation document.
   */
  interface TU {

    /** Returns the unit's translation status (corresponds to the colors in memoQ's translation grid). */
    status(): TUStatus;

    /** Returns match rate of the last inserted match; between 0 and 102. */
    matchRate(): number;

    /** Returns source segment as plain text (excludes all tags and formatting). */
    srcPlain(): string;

    /**
     * Gets or sets target segment as plain text.
     * @param txt If omitted, function returns target segment's text. If present, target segment is overwritten.
     * @returns The target segment, if used as a getter; nothing, if used as a setter.
     */
    trgPlain(txt?: string): string;

    /**
     * Gets the source segment in its full, rich representation.
     * Changing the returned array does not change the document itself.
     * Building the array involves work. If you are accessing segments repeatedly, cache the returned
     * data in your code.
     */
    srcRich(): FormatRange[];

    /**
     * Gets or sets the target segment in its full, rich representation.
     * Changing the returned array does not change the document itself.
     * Building the array involves work. If you are accessing segments repeatedly, cache the returned
     * data in your code.
     * @param seg If omitted, function returns target segment. If present, target segment is overwritten.
     * @returns The target segment, if used as a getter; nothing, if used as a setter.
     */
    trgRich(seg?: FormatRange[]): FormatRange[];
  }

  /**
   * Overall information about the translation document.
   */
  interface DocInfo {

    /** Source language, as a two-letter ISO code (including country code, if present). */
    srcLang: string;

    /** Target language, as a two-letter ISO code (including country code, if present). */
    trgLang: string;

    /** Name of the original document that was imported into memoQ. */
    docName: string;

    /** Number of translation units ("rows") in the document. */
    tuCount: number;
  }

  /**
   * A fully load in-memory translation document that can be queried, changed (partially), and serialized again.
   */
  interface Document {

    /** Returns overall information about the document. */
    info(): DocInfo;

    /**
     * Returns the translation unit ("row") at a given index.
     * The returned [[TU]] object provides functions to change the document's content.
     */
    getTU(ix: number): TU;

    /** Serializes the document into MQXLIFF. */
    writeXliff(): string;
    /** Serializes the document into JSON. */
    writeJson(): string;
  }

  /**
   * Parses a memoQ bilingual XLIFF file.
   * @param xliffstr The MQXLIFF (an XML file) as string.
   * @returns A fully loaded in-memory translation [[Document]].
   */
  function mqxliff(xliffstr: string) : Document;
  export = mqxliff;
}



  /** The content type of a single [[ContentRun]] within a [[FormatRange]]. */
  export enum RunType {
    /** The run contains text. */
    Text = "text",
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
  export interface AttrVal {
    /** Attribue name. */
    attr: string;
    /** Attribute value. */
    val: string;
  }

  /** A single content run within a [[FormatRange]]. */
  export interface ContentRun {
    /** This run's type (text, or a single tag). */
    type?: RunType;
    /** The text of this run. */
    text?: string;
    /** The name of the inline tag. */
    name?: string;
    /**
     * The inline tag's attributes, if any; otherwise, an empty array.
     * Keep in mind that in memoQ's data model, closing tags can have attributes too.
     */
    attrs?: AttrVal[];        
  }

  /** 
   * A single range of formatted text within a segment. The range has uniform formatting (b/i/u/s/s).
   * A range is made up of one or more content runs, which represent either text or tags.
   */
  export interface FormatRange {
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
  export enum TUStatus {
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
  export interface TU {

    /** Gets or sets the unit's translation status (corresponds to the colors in memoQ's translation grid).
     * @param status If omitted, function returns the translation unit's status. If present, it sets the status.
     * @returns The translation unit's status, if used as a getter; nothing, is used as a seetter.
     */
    status(status?: TUStatus): TUStatus | undefined;

    /** Returns match rate of the last inserted match; between 0 and 102. */
    matchRate(): number;

    /** Returns source segment as plain text (excludes all tags and formatting). */
    srcPlain(txt?: string): String | undefined;

    /**
     * Gets or sets target segment as plain text.
     * @param txt If omitted, function returns target segment's text. If present, target segment is overwritten.
     * @returns The target segment, if used as a getter; nothing, if used as a setter.
     */
    trgPlain(txt?: string): String | undefined;

    /**
     * Gets the source segment in its full, rich representation.
     * Changing the returned array does not change the document itself.
     * Building the array involves work. If you are accessing segments repeatedly, cache the returned
     * data in your code.
     */
    srcRich(seg?: FormatRange[]): FormatRange[] | undefined;

    /**
     * Gets or sets the target segment in its full, rich representation.
     * Changing the returned array does not change the document itself.
     * Building the array involves work. If you are accessing segments repeatedly, cache the returned
     * data in your code.
     * @param seg If omitted, function returns target segment. If present, target segment is overwritten.
     * @returns The target segment, if used as a getter; nothing, if used as a setter.
     */
    trgRich(seg?: FormatRange[]): FormatRange[] | undefined;
  }

  /**
   * Overall information about the translation document.
   */
  export interface DocInfo {

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
  export interface Document {

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





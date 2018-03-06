import { Document } from './interfaces';
/**
 * Parses a memoQ bilingual XLIFF file.
 * @param xliffstr The MQXLIFF (an XML file) as string.
 * @returns A fully loaded in-memory translation [[Document]].
 */
declare function mqxliff(xliffstr: string): Document;
export default mqxliff;

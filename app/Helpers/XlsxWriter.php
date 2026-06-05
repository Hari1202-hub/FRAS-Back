<?php

namespace App\Helpers;

/**
 * Minimal xlsx generator using PHP's built-in ZipArchive.
 * No external dependencies — safe to use on any server.
 */
class XlsxWriter
{
    private array $sheets = [];

    public function addSheet(string $name, array $headers, array $rows = []): self
    {
        $this->sheets[] = compact('name', 'headers', 'rows');
        return $this;
    }

    public function download(string $filename): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $tmpFile = tempnam(sys_get_temp_dir(), 'xlsx_');
        $this->writeToFile($tmpFile);

        return response()->streamDownload(function () use ($tmpFile) {
            readfile($tmpFile);
            @unlink($tmpFile);
        }, $filename, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function writeToFile(string $path): void
    {
        $sheetCount = count($this->sheets);
        $files = [];

        $sheetOverrides = '';
        for ($i = 1; $i <= $sheetCount; $i++) {
            $sheetOverrides .= '<Override PartName="/xl/worksheets/sheet' . $i . '.xml"'
                . ' ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        }
        $files['[Content_Types].xml'] =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . $sheetOverrides
            . '</Types>';

        $files['_rels/.rels'] =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>';

        $sheetElements = '';
        foreach ($this->sheets as $idx => $sheet) {
            $num  = $idx + 1;
            $name = $this->xmlAttr($sheet['name']);
            $sheetElements .= "<sheet name=\"{$name}\" sheetId=\"{$num}\" r:id=\"rId{$num}\"/>";
        }
        $files['xl/workbook.xml'] =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
            . ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets>' . $sheetElements . '</sheets>'
            . '</workbook>';

        $wbRels = '';
        foreach ($this->sheets as $idx => $sheet) {
            $num     = $idx + 1;
            $wbRels .= '<Relationship Id="rId' . $num . '"'
                . ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"'
                . ' Target="worksheets/sheet' . $num . '.xml"/>';
        }
        $stylesId = $sheetCount + 1;
        $wbRels  .= '<Relationship Id="rId' . $stylesId . '"'
            . ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"'
            . ' Target="styles.xml"/>';
        $files['xl/_rels/workbook.xml.rels'] =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . $wbRels
            . '</Relationships>';

        $files['xl/styles.xml'] =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<fonts count="2">'
            . '<font><sz val="11"/><name val="Calibri"/></font>'
            . '<font><b/><sz val="11"/><name val="Calibri"/></font>'
            . '</fonts>'
            . '<fills count="2">'
            . '<fill><patternFill patternType="none"/></fill>'
            . '<fill><patternFill patternType="gray125"/></fill>'
            . '</fills>'
            . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="2">'
            . '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            . '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>'
            . '</cellXfs>'
            . '</styleSheet>';

        foreach ($this->sheets as $idx => $sheet) {
            $num = $idx + 1;
            $files["xl/worksheets/sheet{$num}.xml"] = $this->buildSheet($sheet['headers'], $sheet['rows']);
        }

        file_put_contents($path, $this->buildZip($files));
    }

    private function buildZip(array $files): string
    {
        $localParts = '';
        $centralDir = '';
        $offset     = 0;

        foreach ($files as $name => $content) {
            $crc     = \crc32($content);
            $size    = \strlen($content);
            $nameLen = \strlen($name);

            $local = pack('V', 0x04034b50)  // local file header signature
                . pack('v', 20)              // version needed to extract
                . pack('v', 0)               // general purpose bit flag
                . pack('v', 0)               // compression method (stored)
                . pack('v', 0)               // last mod file time
                . pack('v', 0)               // last mod file date
                . pack('V', $crc)            // crc-32
                . pack('V', $size)           // compressed size
                . pack('V', $size)           // uncompressed size
                . pack('v', $nameLen)        // file name length
                . pack('v', 0)               // extra field length
                . $name
                . $content;

            $centralDir .= pack('V', 0x02014b50)  // central file header signature
                . pack('v', 20)                    // version made by
                . pack('v', 20)                    // version needed to extract
                . pack('v', 0)                     // general purpose bit flag
                . pack('v', 0)                     // compression method
                . pack('v', 0)                     // last mod file time
                . pack('v', 0)                     // last mod file date
                . pack('V', $crc)                  // crc-32
                . pack('V', $size)                 // compressed size
                . pack('V', $size)                 // uncompressed size
                . pack('v', $nameLen)              // file name length
                . pack('v', 0)                     // extra field length
                . pack('v', 0)                     // file comment length
                . pack('v', 0)                     // disk number start
                . pack('v', 0)                     // internal file attributes
                . pack('V', 0)                     // external file attributes
                . pack('V', $offset)               // relative offset of local header
                . $name;

            $offset += \strlen($local);
            $localParts .= $local;
        }

        $fileCount      = \count($files);
        $centralDirSize = \strlen($centralDir);

        $end = pack('V', 0x06054b50)     // end of central dir signature
            . pack('v', 0)               // number of this disk
            . pack('v', 0)               // disk with start of central dir
            . pack('v', $fileCount)      // entries on this disk
            . pack('v', $fileCount)      // total entries
            . pack('V', $centralDirSize) // size of central dir
            . pack('V', $offset)         // offset of central dir
            . pack('v', 0);              // comment length

        return $localParts . $centralDir . $end;
    }

    private function buildSheet(array $headers, array $rows): string
    {
        $sheetData = '';

        // Row 1: headers in bold (style index 1)
        $cells = '';
        foreach ($headers as $ci => $header) {
            $col    = $this->colLetter($ci);
            $val    = $this->xmlText($header);
            $cells .= "<c r=\"{$col}1\" t=\"inlineStr\" s=\"1\"><is><t>{$val}</t></is></c>";
        }
        $sheetData .= "<row r=\"1\">{$cells}</row>";

        // Data rows (style index 0, normal)
        foreach ($rows as $ri => $row) {
            $rowNum = $ri + 2;
            $cells  = '';
            foreach ($row as $ci => $val) {
                $col    = $this->colLetter($ci);
                $esc    = $this->xmlText((string) $val);
                $cells .= "<c r=\"{$col}{$rowNum}\" t=\"inlineStr\"><is><t>{$esc}</t></is></c>";
            }
            $sheetData .= "<row r=\"{$rowNum}\">{$cells}</row>";
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<sheetData>' . $sheetData . '</sheetData>'
            . '</worksheet>';
    }

    private function colLetter(int $index): string
    {
        $letter = '';
        $n = $index + 1;
        while ($n > 0) {
            $n--;
            $letter = chr(65 + ($n % 26)) . $letter;
            $n      = (int) ($n / 26);
        }
        return $letter;
    }

    private function xmlText(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private function xmlAttr(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}

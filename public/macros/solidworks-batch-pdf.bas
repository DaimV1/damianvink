Attribute VB_Name = "BatchExportTekeningenNaarPDF"
'
' SolidWorks 2024 VBA-macro — Batch-export open tekeningen naar PDF
' damianvink.nl/toolkit/macros
'
' Wat: loopt door alle op dit moment geopende documenten, en exporteert
' elke tekening (.SLDDRW) die al een bestandspad heeft naar PDF, naast
' het bestaande bestand, met dezelfde naam.
' Parts en assemblies worden overgeslagen.
' Basis-hulpmiddel, geen productiecode. Test eerst op een kopie.
'
' Installeren: Tools > Macro > New, plak deze code in de module (of
' importeer dit .bas-bestand direct via VBA-editor > File > Import File).
'
Option Explicit

Dim swApp As SldWorks.SldWorks

Sub main()

    Set swApp = Application.SldWorks

    Dim swDoc As SldWorks.ModelDoc2
    Set swDoc = swApp.GetFirstDocument

    Dim exported As Integer
    Dim skipped As Integer
    exported = 0
    skipped = 0

    Do While Not swDoc Is Nothing

        If swDoc.GetType = swDocDRAWING Then

            Dim docPath As String
            docPath = swDoc.GetPathName

            If docPath = "" Or InStrRev(docPath, ".") = 0 Then
                skipped = skipped + 1
            Else
                Dim pdfPath As String
                pdfPath = Left(docPath, InStrRev(docPath, ".")) & "pdf"

                Dim saveErrors As Long
                Dim saveWarnings As Long
                Dim ok As Boolean

                ' Eén beschadigd of vergrendeld document mag de rest van de
                ' batch niet afbreken — vang fouten per document af, net als
                ' de Inventor-twin.
                On Error Resume Next
                ok = swDoc.Extension.SaveAs(pdfPath, swSaveAsCurrentVersion, swSaveAsOptions_Silent, Nothing, saveErrors, saveWarnings)
                If Err.Number <> 0 Then
                    ok = False
                    Err.Clear
                End If
                On Error GoTo 0

                If ok And saveErrors = 0 Then
                    exported = exported + 1
                Else
                    skipped = skipped + 1
                End If
            End If

        End If

        Set swDoc = swDoc.GetNext

    Loop

    MsgBox exported & " tekening(en) geëxporteerd naar PDF." & vbCrLf & _
           skipped & " overgeslagen (geen tekening, of nog niet opgeslagen).", vbInformation

End Sub

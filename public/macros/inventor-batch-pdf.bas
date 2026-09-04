Attribute VB_Name = "BatchExportTekeningenNaarPDF"
'
' Inventor 2024 VBA-macro — Batch-export open tekeningen naar PDF
' damianvink.nl/toolkit/macros
'
' Wat: loopt door alle op dit moment geopende documenten, en exporteert
' elke tekening (.idw/.dwg) die al een bestandspad heeft naar PDF, naast
' het bestaande bestand, met dezelfde naam.
' Parts en assemblies worden overgeslagen.
' Basis-hulpmiddel, geen productiecode. Test eerst op een kopie.
'
' Installeren: Alt+F11 (VBA-editor) > Insert > Module > plak deze code.
'
Option Explicit

Sub BatchExportTekeningenNaarPDF()

    ' Vaste, door Autodesk gedocumenteerde AddIn-id van de PDF-vertaler.
    Dim oPDFAddIn As TranslatorAddIn
    Set oPDFAddIn = ThisApplication.ApplicationAddIns.ItemById("{0AC6FD96-2F4D-42CE-8BE0-8AEA580399E4}")

    If oPDFAddIn Is Nothing Then
        MsgBox "PDF-vertaler niet gevonden. Controleer of deze AddIn actief is.", vbCritical
        Exit Sub
    End If

    Dim oDoc As Document
    Dim exported As Integer
    Dim skipped As Integer
    exported = 0
    skipped = 0

    For Each oDoc In ThisApplication.Documents

        If oDoc.DocumentType = kDrawingDocumentObject Then

            If oDoc.FullFileName = "" Or InStrRev(oDoc.FullFileName, ".") = 0 Then
                skipped = skipped + 1
            Else

                Dim pdfPath As String
                pdfPath = Left(oDoc.FullFileName, InStrRev(oDoc.FullFileName, ".")) & "pdf"

                Dim oContext As TranslationContext
                Set oContext = ThisApplication.TransientObjects.CreateTranslationContext
                oContext.Type = kFileBrowseIOMechanism

                Dim oOptions As NameValueMap
                Set oOptions = ThisApplication.TransientObjects.CreateNameValueMap

                Dim oData As DataMedium
                Set oData = ThisApplication.TransientObjects.CreateDataMedium
                oData.FileName = pdfPath

                If oPDFAddIn.HasSaveCopyAsOptions(oDoc, oContext, oOptions) Then
                    ' Standaardopties van de vertaler.
                End If

                On Error Resume Next
                Call oPDFAddIn.SaveCopyAs(oDoc, oContext, oOptions, oData)
                If Err.Number = 0 Then
                    exported = exported + 1
                Else
                    skipped = skipped + 1
                    Err.Clear
                End If
                On Error GoTo 0

            End If

        End If

    Next oDoc

    MsgBox exported & " tekening(en) geëxporteerd naar PDF." & vbCrLf & _
           skipped & " overgeslagen (geen tekening, of nog niet opgeslagen).", vbInformation

End Sub

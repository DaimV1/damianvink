Attribute VB_Name = "ExporteerVlakPatroonNaarDXF"
'
' Inventor 2024 VBA-macro — Exporteer vlak patroon naar DXF
' damianvink.nl/toolkit/macros
'
' Wat: van het actieve plaatwerk-part wordt het vlakke patroon (Flat
' Pattern) opgeslagen als .dxf naast het bestaande bestand, met dezelfde
' naam. Ontvouwt het vlakke patroon automatisch als dat nog niet bestaat.
' Vereist: het actieve document is een plaatwerk-part (Sheet Metal), en
' is al minstens één keer opgeslagen.
' Zie ook de rekenhulp Richtlijnen kanten op deze site voor Ri,
' beenlengte en Z-buiging bij het plaatwerkontwerp zelf.
' Basis-hulpmiddel, geen productiecode. Test eerst op een kopie.
'
' Installeren: Alt+F11 (VBA-editor) > Insert > Module > plak deze code.
'
Option Explicit

Sub ExporteerVlakPatroonNaarDXF()

    Dim oDoc As Document
    Set oDoc = ThisApplication.ActiveDocument

    If oDoc Is Nothing Then
        MsgBox "Geen actief document.", vbExclamation
        Exit Sub
    End If

    If oDoc.DocumentType <> kPartDocumentObject Then
        MsgBox "Geen part-document. Open een plaatwerk-part.", vbExclamation
        Exit Sub
    End If

    If oDoc.FullFileName = "" Then
        MsgBox "Sla het document eerst één keer op (nog geen bestandspad).", vbExclamation
        Exit Sub
    End If

    Dim oPartDoc As PartDocument
    Set oPartDoc = oDoc

    ' Vaste, door Autodesk gedocumenteerde subtype-id van een
    ' plaatwerk-part (Sheet Metal).
    If oPartDoc.SubType <> "{9C464203-9BAE-11D3-8BAD-0060B0CE6BB4}" Then
        MsgBox "Geen plaatwerk-part (Sheet Metal).", vbExclamation
        Exit Sub
    End If

    Dim oCompDef As SheetMetalComponentDefinition
    Set oCompDef = oPartDoc.ComponentDefinition

    If Not oCompDef.HasFlatPattern Then
        oCompDef.Unfold
    End If

    Dim oFlatPattern As FlatPattern
    Set oFlatPattern = oCompDef.FlatPattern

    Dim dxfPath As String
    dxfPath = Left(oDoc.FullFileName, InStrRev(oDoc.FullFileName, ".")) & "dxf"

    ' Vertaleropties; pas AcadVersion of de laagnaam hier evt. aan.
    Dim sOptions As String
    sOptions = "FLAT PATTERN DXF?AcadVersion=2010&OuterProfileLayer=IV_OUTER_PROFILE"

    oFlatPattern.DataIO.WriteDataToFile sOptions, dxfPath

    MsgBox "Opgeslagen als:" & vbCrLf & dxfPath, vbInformation

End Sub

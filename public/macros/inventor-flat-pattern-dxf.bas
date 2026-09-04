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

' Vertaleropties hier aanpassen, niet verderop in de functie.
Private Const ACAD_VERSION As String = "2010"
Private Const OUTER_PROFILE_LAYER As String = "IV_OUTER_PROFILE"

Sub ExporteerVlakPatroonNaarDXF()

    ' ActiveDocument raises when no document is open (it does not return
    ' Nothing), so check Documents.Count first.
    If ThisApplication.Documents.Count = 0 Then
        MsgBox "Geen actief document.", vbExclamation
        Exit Sub
    End If

    Dim oDoc As Document
    Set oDoc = ThisApplication.ActiveDocument

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

    ' Onthoud of het vlakke patroon al bestond — zo niet, ruim het na export
    ' weer op zodat het document niet gewijzigd (dirty) achterblijft, net als
    ' de SolidWorks-twin die de suppress-staat terugzet.
    Dim createdFlatPattern As Boolean
    createdFlatPattern = Not oCompDef.HasFlatPattern

    If createdFlatPattern Then
        oCompDef.Unfold
    End If

    Dim oFlatPattern As FlatPattern
    Set oFlatPattern = oCompDef.FlatPattern

    If InStrRev(oDoc.FullFileName, ".") = 0 Then
        MsgBox "Bestandspad heeft geen extensie.", vbExclamation
        Exit Sub
    End If

    Dim dxfPath As String
    dxfPath = Left(oDoc.FullFileName, InStrRev(oDoc.FullFileName, ".")) & "dxf"

    Dim sOptions As String
    sOptions = "FLAT PATTERN DXF?AcadVersion=" & ACAD_VERSION & "&OuterProfileLayer=" & OUTER_PROFILE_LAYER

    oFlatPattern.DataIO.WriteDataToFile sOptions, dxfPath

    If createdFlatPattern Then
        oFlatPattern.Delete
    End If

    MsgBox "Opgeslagen als:" & vbCrLf & dxfPath, vbInformation

End Sub

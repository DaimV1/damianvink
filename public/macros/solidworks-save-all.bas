Attribute VB_Name = "SlaAllesOp"
'
' SolidWorks 2024 VBA-macro — Sla alle gewijzigde open documenten op
' damianvink.nl/toolkit/macros
'
' Wat: loopt door alle op dit moment geopende documenten en slaat elk
' document met niet-opgeslagen wijzigingen op. Documenten zonder
' wijzigingen, of die nog geen bestandspad hebben, worden overgeslagen.
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

    Dim saved As Integer
    Dim skipped As Integer
    saved = 0
    skipped = 0

    Do While Not swDoc Is Nothing

        If swDoc.GetSaveFlag Then

            If swDoc.GetPathName = "" Then
                skipped = skipped + 1
            Else
                Dim saveErrors As Long
                Dim saveWarnings As Long
                Dim ok As Boolean
                ok = swDoc.Save3(swSaveAsOptions_Silent, saveErrors, saveWarnings)

                If ok And saveErrors = 0 Then
                    saved = saved + 1
                Else
                    skipped = skipped + 1
                End If
            End If

        Else
            skipped = skipped + 1
        End If

        Set swDoc = swDoc.GetNext

    Loop

    MsgBox saved & " document(en) opgeslagen." & vbCrLf & _
           skipped & " overgeslagen (geen wijzigingen, of nog niet opgeslagen).", vbInformation

End Sub

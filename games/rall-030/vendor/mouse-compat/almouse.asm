; Guest-only INT33 callback adapter for legacy Allegro's mickey driver.
; js-dos supplies per-event SI/DI deltas. Allegro 3.x expects cumulative
; callback counters, cleared by INT33/AX=000B. Leave positions/buttons intact.
; Build: nasm -f bin almouse.asm -o ALMOUSE.COM
bits 16
org 100h
jmp install

old_int33: dd 0
app_callback: dd 0
counter_x: dw 0
counter_y: dw 0

int33_hook:
    cmp ax, 000Ch
    je register_callback
    cmp ax, 0014h
    je exchange_callback
    cmp ax, 000Bh
    je clear_counters
    cmp ax, 0000h
    je clear_counters
    cmp ax, 0021h
    je clear_counters
    jmp far [cs:old_int33]

clear_counters:
    mov word [cs:counter_x], 0
    mov word [cs:counter_y], 0
    jmp far [cs:old_int33]

register_callback:
    push es
    push dx
    jmp save_and_wrap

exchange_callback:
    ; INT33/14 must return the application's old callback, not our wrapper.
    push word [cs:app_callback+2]
    push word [cs:app_callback]

save_and_wrap:
    mov [cs:app_callback], dx
    mov [cs:app_callback+2], es
    test cx, cx
    jz call_original
    push cs
    pop es
    mov dx, mouse_callback
call_original:
    pushf
    call far [cs:old_int33]
    pop dx
    pop es
    iret

mouse_callback:
    pushf
    push si
    push di
    add si, [cs:counter_x]
    add di, [cs:counter_y]
    mov [cs:counter_x], si
    mov [cs:counter_y], di
    call far [cs:app_callback]
    pop di
    pop si
    popf
    retf

resident_end:
install:
    push cs
    pop ds
    mov ax, 3533h
    int 21h
    mov [old_int33], bx
    mov [old_int33+2], es
    mov dx, int33_hook
    mov ax, 2533h
    int 21h
    mov dx, (resident_end - $$ + 100h + 15) / 16
    mov ax, 3100h
    int 21h

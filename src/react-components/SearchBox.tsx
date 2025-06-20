import * as React from 'react';

interface Props {
    onValueChange: (value: string) => void;
    placeholder?: string;
}


// In SearchBox.tsx
export function SearchBox(props: Props & React.HTMLProps<HTMLInputElement>) {
    return (
        <input
            type="text"
            placeholder={props.placeholder || "Search..."}
            onChange={e => props.onValueChange(e.target.value)}
            className={props.className}
            style={props.style}
            value={props.value}
        />
    );
}
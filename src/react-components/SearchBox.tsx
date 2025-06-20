import * as React from 'react';

interface Props {
    onValueChange: (value: string) => void;
}


// In SearchBox.tsx
export function SearchBox(props: Props & React.HTMLProps<HTMLInputElement>) {
    return (
        <input
            type="text"
            placeholder="Search..."
            onChange={e => props.onValueChange(e.target.value)}
            className={props.className}
            style={props.style}
        />
    );
}
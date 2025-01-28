import nested from 'postcss-nested';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
    plugins: [
       nested,
       tailwindcss,
       autoprefixer,
    ],
};
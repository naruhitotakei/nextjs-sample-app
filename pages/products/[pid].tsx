import { useRouter } from 'next/router';
import ErrorMessage from '../../components/error';
import Form from '../../components/form';
import Loading from '../../components/loading';
import { useProductList } from '../../lib/hooks';
import { FormData } from '../../types';

const ProductInfo = () => {
    const router = useRouter();
    const { pid } = router.query;
    const { isError, isLoading, list = [], mutateList } = useProductList();
    const product = list.find(item => item.id === Number(pid));
    const { description, is_visible: isVisible, name, price, type } = product ?? {};
    const formData = { description, isVisible, name, price, type };

    const handleCancel = () => router.push('/products');

    const handleSubmit = async (data: FormData) => {
        try {
            const filteredList = list.filter(item => item.id !== Number(pid));
            // Update local data immediately (reduce latency to user)
            mutateList([...filteredList, { ...product, ...data }], false);

            // Update product details
            await fetch(`/api/products/${pid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            // Refetch to validate local data
            mutateList();

            router.push('/products');
        } catch (error) {
            console.error('Error updating the product: ', error);
        }
    };

    if (isLoading) return <Loading />;
    if (isError) return <ErrorMessage />;

    return (
        <Form formData={formData} onCancel={handleCancel} onSubmit={handleSubmit} />
    );
};

export default ProductInfo;

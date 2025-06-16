import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db } from '../db';
import { packages, packageHistory } from '../db/schema';
import { eq } from 'drizzle-orm';

export const server = {
    // Get package status by tracking number
    getPackageStatus: defineAction({
        accept: "form",
        input: z.object({
            trackingNumber: z.string().min(10, 'El numero de gui es requerido'),
        }),
        handler: async ({ trackingNumber }) => {
            try {
                const packageData = await db.query.packages.findFirst(
                    {
                        where: eq(packages.trackingNumber, trackingNumber)
                    }
                )

                if (!packageData) {
                    return null
                    /* throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Package not found with this tracking number',
                    }); */
                }

                // Get package history
                const history = await db
                    .select()
                    .from(packageHistory)
                    .where(eq(packageHistory.packageId, packageData.id))
                    .orderBy(packageHistory.createdAt);

                console.log(packageData);

                return {
                    package: packageData,
                    history,
                };
            } catch (error) {
                if (error instanceof ActionError) {
                    throw error;
                }
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve package information',
                });
            }
        },
    }),

    // Update package status (admin function)
    updatePackageStatus: defineAction({
        accept: 'form',
        input: z.object({
            trackingNumber: z.string().min(1, 'Tracking number is required'),
            status: z.enum(['Processing', 'In Transit', 'Out for Delivery', 'Delivered', 'Exception']),
            location: z.string().min(1, 'Location is required'),
            description: z.string().optional(),
        }),
        handler: async ({ trackingNumber, status, location, description }) => {
            try {
                // Find the package
                const packageData = await db
                    .select()
                    .from(packages)
                    .where(eq(packages.trackingNumber, trackingNumber))
                    .limit(1);

                if (packageData.length === 0) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Package not found with this tracking number',
                    });
                }

                const packageInfo = packageData[0];

                // Update package status
                await db
                    .update(packages)
                    .set({
                        status,
                        officeRecipientAddress: location,
                    })
                    .where(eq(packages.id, packageInfo.id));

                // Add to history
                /*     await db.insert(packageHistory).values({
                        packageId: packageInfo.id,
                        status,
                        location,
                        description: description || `Status updated to ${status}`,
                    }); */

                return {
                    success: true,
                    message: 'Package status updated successfully',
                    trackingNumber,
                    newStatus: status,
                };
            } catch (error) {
                if (error instanceof ActionError) {
                    throw error;
                }
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update package status',
                });
            }
        },
    }),

    // Get all packages (admin function)
    getAllPackages: defineAction({
        handler: async () => {
            try {
                const allPackages = await db.select().from(packages);
                return { packages: allPackages };
            } catch (error) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve packages',
                });
            }
        },
    }),
};